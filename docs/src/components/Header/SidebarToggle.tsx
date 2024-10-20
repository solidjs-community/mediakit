import type { Component } from 'solid-js'
import { Show, createEffect, createSignal } from 'solid-js'

const MenuToggle: Component = () => {
  const [sidebarShown, setSidebarShown] = createSignal(false)

  createEffect(() => {
    const body = document.querySelector('html')!
    if (sidebarShown()) {
      body.classList.add('mobile-sidebar-toggle')
    } else {
      body.classList.remove('mobile-sidebar-toggle')
    }
  })

  return (
    <button
      type='button'
      aria-pressed={sidebarShown() ? 'true' : 'false'}
      id='menu-toggle'
      onClick={() => setSidebarShown((s) => !s)}
    >
      <Show
        when={sidebarShown()}
        fallback={
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='1em'
            height='1em'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              stroke-linecap='round'
              stroke-linejoin='round'
              stroke-width='2'
              d='M4 6h16M4 12h16M4 18h16'
            />
          </svg>
        }
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='1em'
          height='1em'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
        >
          <path
            stroke-linecap='round'
            stroke-linejoin='round'
            stroke-width='2'
            d='M6 18L18 6M6 6l12 12'
          ></path>
        </svg>
      </Show>
      <span class='sr-only'>Toggle sidebar</span>
    </button>
  )
}

export default MenuToggle
