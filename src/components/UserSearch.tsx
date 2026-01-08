import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { fetchUser, searchUser } from '../api/github'
import UserCard from './UserCard'
import RecentSearches from './RecentSearches'
import { useDebounce } from 'use-debounce'
import SuggestionDropdown from './SuggestionDropdown'

export default function UserSearch() {
  const [username, setUsername] = useState('')
  const [submittedUsername, setSubmittedUsername] = useState('')
  const [recentUsers, setRecentUsers] = useState<string[]>(() => {
    const stored = localStorage.getItem('recentUsers')
    return stored ? JSON.parse(stored) : []
  })

  const [debouncedUserName] = useDebounce(username, 300)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Query to fetch user suggestions for search
  const { data: suggestions } = useQuery({
    queryKey: ['github-user-suggestions', debouncedUserName],
    queryFn: () => searchUser(debouncedUserName),
    enabled: debouncedUserName.length > 1,
  })

  // Query to fetch specific user
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['users', submittedUsername],
    queryFn: () => fetchUser(submittedUsername),
    enabled: !!submittedUsername,
    retry: false,
  })

  // Not implemented, but as example
  //     const someMutation = useMutation({
  //       mutationFn: () => {
  //         console.log('call some put request')
  //       },
  //       onSuccess: () => {
  //         console.log('Do work after success')
  //         refetch()
  //       },
  //       onError: (error) => {
  //         console.error(error.message)
  //       },
  //     })

  //     function handleMutation() {
  //       someMutation.mutate() // calls mutationFn
  //     }

  //   someMutation.isIdle, someMutation.isPending, etc

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = username.trim()
    if (!trimmed) {
      return
    }

    setSubmittedUsername(trimmed)
    setUsername('')
    setRecentUsers((prev) => {
      const updated = [trimmed, ...prev.filter((user) => user !== trimmed)]

      return updated.slice(0, 5)
    })
  }

  useEffect(() => {
    localStorage.setItem('recentUsers', JSON.stringify(recentUsers))
  }, [recentUsers])

  return (
    <>
      <form onSubmit={handleSubmit} className="form">
        <div className="dropdown-wrapper">
          <input
            type="text"
            placeholder="Enter GitHub Username..."
            value={username}
            onChange={(event) => {
              const value = event.target.value

              setUsername(value)
              setShowSuggestions(value.trim().length > 1)
            }}
          />

          {showSuggestions && suggestions?.length > 0 && (
            <SuggestionDropdown
              suggestions={suggestions}
              show={showSuggestions}
              onSelect={(selectedUser: string) => {
                setUsername(selectedUser)
                setShowSuggestions(false)

                if (submittedUsername !== selectedUser) {
                  setSubmittedUsername(selectedUser)
                } else {
                  refetch()
                }

                setRecentUsers((prev) => {
                  const updated = [
                    selectedUser,
                    ...prev.filter((user) => user !== selectedUser),
                  ]

                  return updated.slice(0, 5)
                })
              }}
            />
          )}
        </div>

        <button type="submit">Search</button>
      </form>

      {isLoading && <p className="status">Loading...</p>}

      {isError && <p className="status error">{error.message}</p>}

      {data && <UserCard user={data} />}

      {recentUsers.length > 0 && (
        <RecentSearches
          users={recentUsers}
          onSelect={(username) => {
            setUsername(username)
            setSubmittedUsername(username)
          }}
        />
      )}
    </>
  )
}
