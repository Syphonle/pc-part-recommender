"use client";

import { games } from "@/lib/data/games";
import type { GameTarget } from "@/lib/types";
import { NumberField } from "./NumberField";

const DEFAULT_TARGET_FPS = 60;

export function GameSelector({
  selected,
  onChange,
}: {
  selected: GameTarget[];
  onChange: (targets: GameTarget[]) => void;
}) {
  const targetByGameId = new Map(selected.map((s) => [s.gameId, s.targetFps]));

  function toggleGame(gameId: string) {
    if (targetByGameId.has(gameId)) {
      onChange(selected.filter((s) => s.gameId !== gameId));
    } else {
      onChange([...selected, { gameId, targetFps: DEFAULT_TARGET_FPS }]);
    }
  }

  function setTargetFps(gameId: string, targetFps: number) {
    onChange(selected.map((s) => (s.gameId === gameId ? { ...s, targetFps } : s)));
  }

  return (
    <div
      className="max-h-72 overflow-y-auto rounded border"
      style={{ borderColor: "var(--viz-baseline)" }}
    >
      {games.map((game, i) => {
        const targetFps = targetByGameId.get(game.id);
        const isSelected = targetFps !== undefined;
        return (
          <div
            key={game.id}
            className={`flex items-center gap-3 px-3 py-2 text-sm ${i > 0 ? "border-t" : ""}`}
            style={{ borderColor: "var(--surface-border)" }}
          >
            <input
              type="checkbox"
              id={`game-${game.id}`}
              checked={isSelected}
              onChange={() => toggleGame(game.id)}
              className="h-3.5 w-3.5 shrink-0 accent-[var(--accent)]"
            />
            <label htmlFor={`game-${game.id}`} className="min-w-0 flex-1 cursor-pointer truncate" style={{ color: "var(--viz-text-primary)" }}>
              {game.name}
            </label>
            {isSelected && (
              <label className="flex shrink-0 items-center gap-1.5 text-xs" style={{ color: "var(--viz-text-secondary)" }}>
                Target FPS
                <NumberField
                  min={1}
                  max={500}
                  value={targetFps}
                  onChange={(value) => setTargetFps(game.id, value)}
                  className="w-14 rounded border px-1.5 py-1 text-sm tabular-nums"
                  style={{
                    borderColor: "var(--viz-baseline)",
                    color: "var(--viz-text-primary)",
                    backgroundColor: "var(--background)",
                  }}
                />
              </label>
            )}
          </div>
        );
      })}
    </div>
  );
}
