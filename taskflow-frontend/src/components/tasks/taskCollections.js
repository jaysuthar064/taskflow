const sortTasksInsideGroup = (firstTask, secondTask) => {
  if (firstTask.completed !== secondTask.completed) {
    return Number(firstTask.completed) - Number(secondTask.completed);
  }

  if (firstTask.reminder && secondTask.reminder) {
    return new Date(firstTask.reminder) - new Date(secondTask.reminder);
  }

  if (firstTask.reminder) {
    return -1;
  }

  if (secondTask.reminder) {
    return 1;
  }

  return new Date(secondTask.createdAt || 0) - new Date(firstTask.createdAt || 0);
};

export const getTaskCollectionKey = (title = "") => String(title || "").trim().toLowerCase();

export const groupTasksByCollection = (tasks = []) => {
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const groupedTasks = safeTasks.reduce((collectionMap, task) => {
    const cleanTitle = task.title?.trim() || "Untitled Task";
    const groupKey = getTaskCollectionKey(cleanTitle);

    if (!collectionMap.has(groupKey)) {
      collectionMap.set(groupKey, {
        id: groupKey,
        title: cleanTitle,
        tasks: [],
        pendingCount: 0,
        latestCreatedAt: task.createdAt || null
      });
    }

    const currentGroup = collectionMap.get(groupKey);
    currentGroup.tasks.push(task);
    currentGroup.pendingCount += task.completed ? 0 : 1;

    if (!currentGroup.latestCreatedAt || new Date(task.createdAt || 0) > new Date(currentGroup.latestCreatedAt || 0)) {
      currentGroup.latestCreatedAt = task.createdAt || currentGroup.latestCreatedAt;
    }

    return collectionMap;
  }, new Map());

  return Array.from(groupedTasks.values())
    .map((group) => ({
      ...group,
      tasks: [...group.tasks].sort(sortTasksInsideGroup)
    }))
    .sort((firstGroup, secondGroup) => new Date(secondGroup.latestCreatedAt || 0) - new Date(firstGroup.latestCreatedAt || 0));
};
