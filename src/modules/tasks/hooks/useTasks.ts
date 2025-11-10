import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskApi } from "../services/taskApi";

export const useTasks = () => {
  const queryClient = useQueryClient();

  const tasks = useQuery({
    queryKey: ["tasks"],
    queryFn: TaskApi.getAll,
  });

  const createTask = useMutation({
    mutationFn: (data: any) => TaskApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const updateTask = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => TaskApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const updateBOM = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => TaskApi.updateBOM(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const approveBOM = useMutation({
    mutationFn: ({ id, approve }: { id: number; approve: boolean }) =>
      TaskApi.approveBOM(id, approve),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  return { 
    data: tasks.data,
    tasks: tasks.data, 
    isLoading: tasks.isLoading, 
    isError: tasks.isError,
    createTask, 
    updateTask, 
    updateBOM, 
    approveBOM 
  };
};
