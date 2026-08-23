import type { Benchmark, Case, Cpu, Game, Gpu, Motherboard, Psu, Ram, Storage } from "../types";
import { benchmarks } from "./benchmarks";
import { games } from "./games";
import { cases, cpus, gpus, motherboards, psus, rams, storages } from "./parts";

/**
 * Everything the recommendation engine needs about parts, prices, and benchmarks.
 * Today this is backed by the local seed data below. Swap `localPartsProvider` for an
 * implementation backed by a live pricing API / scraper later without touching
 * lib/recommend.ts or any UI code — they only depend on this interface.
 */
export interface PartsProvider {
  getGpus(): Gpu[];
  getCpus(): Cpu[];
  getMotherboards(): Motherboard[];
  getRams(): Ram[];
  getStorages(): Storage[];
  getPsus(): Psu[];
  getCases(): Case[];
  getGames(): Game[];
  getBenchmarks(): Benchmark[];
}

export const localPartsProvider: PartsProvider = {
  getGpus: () => gpus,
  getCpus: () => cpus,
  getMotherboards: () => motherboards,
  getRams: () => rams,
  getStorages: () => storages,
  getPsus: () => psus,
  getCases: () => cases,
  getGames: () => games,
  getBenchmarks: () => benchmarks,
};
