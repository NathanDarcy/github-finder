import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { fetchUser } from '../api/github'
import UserCard from './UserCard'

export default function UserSearch() {
  const [username, setUsername] = useState('')
  const [submittedUsername, setSubmittedUsername] = useState('')

  // useQuery example
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users', submittedUsername],
    queryFn: () => fetchUser(submittedUsername),
    enabled: !!submittedUsername,
  })

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmittedUsername(username.trim())
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="Enter GitHub Username..."
          value={username}
          onChange={(event) => {
            setUsername(event.target.value)
          }}
        />

        <button type="submit">Search</button>
      </form>

      {isLoading && <p className="status">Loading...</p>}

      {isError && <p className="status error">{error.message}</p>}

      {data && <UserCard user={data} />}
    </>
  )
}
