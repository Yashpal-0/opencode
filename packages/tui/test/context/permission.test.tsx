import { expect, test } from "bun:test"
import { renderLocal, session } from "../fixture/local"

test("permission mode applies to one session and its subagents only", async () => {
  await using setup = await renderLocal()
  setup.data.session.remember(session("ses_first"))
  setup.data.session.remember({ ...session("ses_child"), parentID: "ses_first" })
  setup.data.session.remember(session("ses_second"))

  await setup.local.permission.set("ses_first", "autoaccept")
  expect(setup.local.permission.mode("ses_first")).toBe("autoaccept")
  expect(setup.local.permission.mode("ses_child")).toBe("autoaccept")
  expect(setup.local.permission.mode("ses_second")).toBe("prompt")
  expect(setup.local.permission.mode()).toBe("prompt")

  await setup.local.permission.set("ses_child", "prompt")
  expect(setup.local.permission.mode("ses_first")).toBe("prompt")
})

test("a session's own permission mode overrides --auto", async () => {
  await using setup = await renderLocal({ args: { auto: true } })
  setup.data.session.remember(session("ses_first"))

  await setup.local.permission.set("ses_first", "prompt")
  expect(setup.local.permission.mode("ses_first")).toBe("prompt")
  expect(setup.local.permission.mode("ses_second")).toBe("autoaccept")
})
