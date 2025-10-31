import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskApi } from "../services/taskApi";

export const useTasks = () => {
  const queryClient = useQueryClient();

  const tasks = useQuery(["tasks"], TaskApi.getAll);

  const createTask = useMutation(TaskApi.create, {
    onSuccess: () => queryClient.invalidateQueries(["tasks"]),
  });

  const updateTask = useMutation(
    ({ id, data }: { id: number; data: any }) => TaskApi.update(id, data),
    { onSuccess: () => queryClient.invalidateQueries(["tasks"]) }
  );

  const updateBOM = useMutation(
    ({ id, data }: { id: number; data: any }) => TaskApi.updateBOM(id, data),
    { onSuccess: () => queryClient.invalidateQueries(["tasks"]) }
  );

  const approveBOM = useMutation(
    ({ id, approve }: { id: number; approve: boolean }) =>
      TaskApi.approveBOM(id, approve),
    { onSuccess: () => queryClient.invalidateQueries(["tasks"]) }
  );

  return { tasks, createTask, updateTask, updateBOM, approveBOM };
};
