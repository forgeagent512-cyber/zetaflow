"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { geoService } from "@/services/geo.service";

interface GEOState {
  entities: any[];
  knowledgeGraphs: any[];
  topicClusters: any[];
  currentEntity: any | null;
  isFetching: boolean;
  fetchEntities: () => Promise<void>;
  fetchEntity: (id: string) => Promise<void>;
  createEntity: (data: any) => Promise<any>;
  updateEntity: (id: string, data: any) => Promise<any>;
  deleteEntity: (id: string) => Promise<void>;
  buildKnowledgeGraph: (name: string, description: string, entities: any[]) => Promise<any>;
  fetchTopicClusters: () => Promise<void>;
  createTopicCluster: (data: any) => Promise<any>;
}

export const useGEOStore = create<GEOState>()(
  persist(
    (set, get) => ({
      entities: [],
      knowledgeGraphs: [],
      topicClusters: [],
      currentEntity: null,
      isFetching: false,

      fetchEntities: async () => {
        set({ isFetching: true });
        try {
          const result = await geoService.getEntities();
          set({ entities: result.data ?? [], isFetching: false });
        } catch {
          set({ isFetching: false });
        }
      },

      fetchEntity: async (id) => {
        set({ isFetching: true });
        try {
          const result = await geoService.getEntity(id);
          set({ currentEntity: result.data ?? null, isFetching: false });
        } catch {
          set({ isFetching: false });
        }
      },

      createEntity: async (data) => {
        set({ isFetching: true });
        try {
          const result = await geoService.createEntity(data);
          set((state) => ({ entities: [...state.entities, result.data], isFetching: false }));
          return result.data;
        } catch (error) {
          set({ isFetching: false });
          throw error;
        }
      },

      updateEntity: async (id, data) => {
        set({ isFetching: true });
        try {
          const result = await geoService.updateEntity(id, data);
          set((state) => ({
            entities: state.entities.map((e) => (e.id === id ? { ...e, ...result.data } : e)),
            currentEntity: state.currentEntity?.id === id ? { ...state.currentEntity, ...result.data } : state.currentEntity,
            isFetching: false,
          }));
          return result.data;
        } catch (error) {
          set({ isFetching: false });
          throw error;
        }
      },

      deleteEntity: async (id) => {
        try {
          await geoService.deleteEntity(id);
          set((state) => ({ entities: state.entities.filter((e) => e.id !== id) }));
        } catch {}
      },

      buildKnowledgeGraph: async (name, description, entities) => {
        set({ isFetching: true });
        try {
          const result = await geoService.buildKnowledgeGraph(name, description, entities);
          set((state) => ({ knowledgeGraphs: [...state.knowledgeGraphs, result.data], isFetching: false }));
          return result.data;
        } catch (error) {
          set({ isFetching: false });
          throw error;
        }
      },

      fetchTopicClusters: async () => {
        set({ isFetching: true });
        try {
          const result = await geoService.getTopicClusters();
          set({ topicClusters: result.data ?? [], isFetching: false });
        } catch {
          set({ isFetching: false });
        }
      },

      createTopicCluster: async (data) => {
        set({ isFetching: true });
        try {
          const result = await geoService.createTopicCluster(data);
          set((state) => ({ topicClusters: [...state.topicClusters, result.data], isFetching: false }));
          return result.data;
        } catch (error) {
          set({ isFetching: false });
          throw error;
        }
      },
    }),
    { name: "buildagent-geo-store" }
  )
);
