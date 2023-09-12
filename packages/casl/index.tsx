import { createContext, type JSX, useContext, Show } from 'solid-js'
import { type AnyAbility } from '@casl/ability'

export const AbilityContext = createContext<{
  getAbility: () => AnyAbility | undefined
}>(undefined)

export function AbilityProvider(props: {
  getAbility: () => AnyAbility | undefined
  children: JSX.Element
}) {
  return (
    <AbilityContext.Provider value={{ getAbility: props.getAbility }}>
      {props.children}
    </AbilityContext.Provider>
  )
}

export function Can(props: {
  I: Parameters<AnyAbility['can']>[0]
  a?: Parameters<AnyAbility['can']>[1]
  children: JSX.Element
  fallback?: JSX.Element
  not?: boolean
}) {
  const ctx = useContext(AbilityContext)
  if (!ctx) throw new Error(`<Can> can only be used inside Ability Context`)

  const canRender = () => {
    try {
      const ability = ctx.getAbility()
      return props.not
        ? ability?.cannot(props.I, props.a)
        : ability?.can(props.I, props.a)
    } catch (err) {
      console.error(`sakjdbhudhv`, err)
    }
  }

  return (
    <Show when={canRender()} fallback={props.fallback || <>loading</>}>
      {props.children}
    </Show>
  )
}
