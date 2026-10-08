import { useConfig } from "../config"
import { useArgs } from "./args"
import { useData } from "./data"
import { createSimpleContext } from "./helper"
import { useStorage } from "./storage"

export type PermissionMode = "prompt" | "autoaccept"

export const { use: usePermission, provider: PermissionProvider } = createSimpleContext({
  name: "Permission",
  init: () => {
    const args = useArgs()
    const config = useConfig()
    const data = useData()
    // Keyed by root session ID so subagents follow the session that started them.
    const [store, update] = useStorage().store<{ sessions: Record<string, PermissionMode> }>("permissions", {
      initial: { sessions: {} },
    })
    const fallback = () => (args.auto ? "autoaccept" : config.data.session.permissions)
    return {
      /** A session's own choice wins. Sessions without one, and new sessions, follow `--auto` and then `session.permissions`. */
      mode(sessionID?: string): PermissionMode {
        if (!sessionID) return fallback()
        return store.sessions[data.session.root(sessionID)] ?? fallback()
      },
      set(sessionID: string, mode: PermissionMode) {
        const rootID = data.session.root(sessionID)
        return update((draft) => {
          draft.sessions[rootID] = mode
        })
      },
    }
  },
})
