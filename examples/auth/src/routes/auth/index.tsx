import { Component, createEffect, VoidComponent } from 'solid-js'
import { AiFillGithub } from 'solid-icons/ai'
import { FaBrandsDiscord } from 'solid-icons/fa'
import { A } from '@solidjs/router'
import { capitalize } from '~/utils/string'
import { useAuth } from '@solid-mediakit/auth/client'

const Auth: VoidComponent = () => {
  return (
    <div class='flex flex-col gap-4 items-center h-full w-full'>
      <h1 class='text-3xl font-bold text-offwhite'>
        Log In To{' '}
        <span class='decoration-offwhite underline decoration-dotted text-white'>
          HackChat
        </span>
      </h1>
      <div class='flex flex-col gap-3 w-[300px] items-center'>
        <SignInMethod name='github' />
        <SignInMethod name='discord' />
        <div class='my-3 w-[80%] rounded-lg bg-gray-200 h-[0.5px]' />
        <p class='text-gray-300 font-semibold text-sm w-full text-center'>
          For privacy of the users, you are required to Sign In before sending
          any messages.
        </p>
      </div>
    </div>
  )
}

export default Auth

const SignInMethod: Component<{ name: 'github' | 'discord' }> = (props) => {
  const auth = useAuth()
  return (
    <button
      style={{
        'box-shadow': `0 0 0 1px ${
          props.name === 'github' ? '#24292e' : '#5865F2'
        }`,
      }}
      class={`flex gap-2 items-center w-full justify-center transition-all select-none ${
        props.name === 'github'
          ? 'bg-[#24292e] hover:bg-[#555] hover:shadow-[#555]'
          : 'hover:shadow-[#5865F2] bg-[#5865F2] hover:bg-opacity-80'
      } text-white px-[14px] h-12 rounded-lg font-medium`}
      onClick={() => {
        const w = window.open(
          `${window.location.origin}/auth/${props.name}`,
          `Sign In With ${capitalize(props.name)}`,
        )
        setInterval(async () => {
          console.log(
            w?.closed,
            auth.session(),
            w?.closed && (await auth.refetch(true)),
          )
        }, 1000)
      }}
    >
      {props.name === 'github' ? (
        <AiFillGithub size={25} />
      ) : (
        <FaBrandsDiscord size={25} />
      )}
      Continue With {capitalize(props.name)}
    </button>
  )
}
