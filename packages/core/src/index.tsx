import { createSignal } from 'solid-js'

export const HelloComponent = () => {
  return <div>hey</div>
}

export const Toggler = () => {
  const [toggled, setToggled] = createSignal(false)
  return (
    <div>
      <button onClick={() => setToggled(!toggled())}>Toggle</button>
      {toggled() ? <div>hey</div> : null}
    </div>
  )
}
