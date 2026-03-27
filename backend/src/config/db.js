import mongoose from "mongoose";
import dns from "dns";
import { execFile } from "child_process";
import { promisify } from "util";

const DEFAULT_DB_NAME = "taskflow";
const DEFAULT_SERVER_SELECTION_TIMEOUT_MS = 10_000;
const execFileAsync = promisify(execFile);

const getMongoConnectionString = () =>
    (process.env.MONGO_URL || process.env.MONGODB_URI || "").trim();

const getMongoDbName = (connectionString) => {
    const explicitDbName = (process.env.MONGO_DB_NAME || process.env.DB_NAME || "").trim();

    if (explicitDbName) {
        return explicitDbName;
    }

    const dbNameFromPath = decodeURIComponent(
        connectionString.split("?")[0].split("/").at(-1) || ""
    ).trim();

    return dbNameFromPath || DEFAULT_DB_NAME;
};

const configureMongoDnsServers = () => {
    const rawDnsServers = (process.env.MONGO_DNS_SERVERS || "").trim();

    if (!rawDnsServers) {
        return;
    }

    const dnsServers = rawDnsServers
        .split(",")
        .map((server) => server.trim())
        .filter(Boolean);

    if (dnsServers.length === 0) {
        return;
    }

    dns.setServers(dnsServers);
    console.log(`Using custom DNS servers for MongoDB SRV lookups: ${dnsServers.join(", ")}`);
};

const sanitizeConnectionString = (connectionString) =>
    connectionString.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");

const normalizeToArray = (value) => {
    if (Array.isArray(value)) {
        return value;
    }

    if (value === undefined || value === null || value === "") {
        return [];
    }

    return [value];
};

const isSrvLookupError = (error) => {
    const message = String(error?.message || "");

    return /querySrv|ECONNREFUSED|ENOTFOUND|ETIMEOUT|EAI_AGAIN|ESERVFAIL/i.test(message);
};

const isAtlasIpAccessError = (error) => {
    const message = String(error?.message || "");

    return /whitelist|network access|Could not connect to any servers in your MongoDB Atlas cluster/i.test(message);
};

const buildDirectAtlasConnectionString = async (connectionString, dbName) => {
    if (process.platform !== "win32") {
        return "";
    }

    const match = connectionString.match(/^mongodb\+srv:\/\/([^@]+)@([^/?]+)(\/[^?]*)?(\?.*)?$/i);

    if (!match) {
        return "";
    }

    const [, authSegment, clusterHost, pathFromUri = "", rawQuery = ""] = match;
    const powershellScript = `
$ErrorActionPreference = 'Stop'
$srvRecords = @(Resolve-DnsName -Type SRV '_mongodb._tcp.${clusterHost}' | Select-Object NameTarget, Port)
$txtRecords = @()
try {
    $txtRecords = @(Resolve-DnsName -Type TXT '${clusterHost}' | ForEach-Object { $_.Strings } | Where-Object { $_ })
} catch {
    $txtRecords = @()
}
[pscustomobject]@{
    srv = $srvRecords
    txt = $txtRecords
} | ConvertTo-Json -Compress -Depth 4
`;

    const { stdout } = await execFileAsync(
        "powershell.exe",
        ["-NoProfile", "-Command", powershellScript],
        {
            windowsHide: true,
            maxBuffer: 1024 * 1024
        }
    );

    const resolution = JSON.parse(stdout || "{}");
    const srvHosts = normalizeToArray(resolution?.srv)
        .map((record) => {
            const host = String(record?.NameTarget || "").trim().replace(/\.$/, "");
            const port = Number(record?.Port) || 27017;

            return host ? `${host}:${port}` : "";
        })
        .filter(Boolean);

    if (srvHosts.length === 0) {
        return "";
    }

    const txtQuery = normalizeToArray(resolution?.txt)
        .map((value) => String(value || "").trim())
        .join("");
    const mergedQuery = new URLSearchParams(txtQuery);

    for (const [key, value] of new URLSearchParams(rawQuery.replace(/^\?/, ""))) {
        mergedQuery.set(key, value);
    }

    if (!mergedQuery.has("tls") && !mergedQuery.has("ssl")) {
        mergedQuery.set("tls", "true");
    }

    const path = pathFromUri && pathFromUri !== "/" ? pathFromUri : `/${dbName}`;
    return `mongodb://${authSegment}@${srvHosts.join(",")}${path}?${mergedQuery.toString()}`;
};

const connectWithMongoose = async (connectionString, dbName, serverSelectionTimeoutMS) => {
    await mongoose.connect(connectionString, {
        dbName,
        serverSelectionTimeoutMS
    });
};

const connectDB = async () => {
    const connectionString = getMongoConnectionString();

    try {
        if (!connectionString) {
            throw new Error("MONGO_URL or MONGODB_URI is not set");
        }

        const dbName = getMongoDbName(connectionString);
        const sanitizedUrl = sanitizeConnectionString(connectionString);
        const serverSelectionTimeoutMS =
            Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || DEFAULT_SERVER_SELECTION_TIMEOUT_MS;

        configureMongoDnsServers();

        console.log(`Connecting to MongoDB: ${sanitizedUrl}`);
        console.log(`MongoDB database: ${dbName}`);

        await connectWithMongoose(connectionString, dbName, serverSelectionTimeoutMS);

        console.log(
            `Database connected successfully (${mongoose.connection.host}/${mongoose.connection.name})`
        );
    } catch (error) {
        const dbName = getMongoDbName(connectionString);
        const serverSelectionTimeoutMS =
            Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || DEFAULT_SERVER_SELECTION_TIMEOUT_MS;

        if (connectionString.startsWith("mongodb+srv://") && isSrvLookupError(error)) {
            try {
                const directConnectionString = await buildDirectAtlasConnectionString(connectionString, dbName);

                if (directConnectionString) {
                    console.warn("MongoDB SRV lookup failed. Retrying with Windows DNS fallback.");
                    console.log(`Fallback MongoDB URI: ${sanitizeConnectionString(directConnectionString)}`);

                    await connectWithMongoose(directConnectionString, dbName, serverSelectionTimeoutMS);

                    console.log(
                        `Database connected successfully (${mongoose.connection.host}/${mongoose.connection.name})`
                    );
                    return;
                }
            } catch (fallbackError) {
                error = fallbackError;
            }
        }

        console.error("Database connection failed:", error.message);

        if (connectionString.startsWith("mongodb+srv://") && isSrvLookupError(error)) {
            console.error(
                "Atlas SRV lookup failed. Use system DNS by default, or set MONGO_DNS_SERVERS only if your network needs custom resolvers."
            );
        }

        if (isAtlasIpAccessError(error)) {
            console.error(
                "MongoDB Atlas blocked this machine. Add your current public IP to Atlas Network Access or allow 0.0.0.0/0 for development."
            );
        }

        process.exit(1);
    }
}

export default connectDB;
