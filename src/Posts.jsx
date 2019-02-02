import React from 'react'
import { connectPostsApp } from './overmind-posts-app'

class Posts extends React.Component {
  componentDidMount() {
    this.props.overmind.actions.getPosts()
  }
  render() {
    const { overmind } = this.props

    return (
      <div>
        {overmind.state.isLoadingPosts ? (
          <h4>Loading...</h4>
        ) : (
          <div>
            Show count:{' '}
            <select
              value={overmind.state.showCount}
              onChange={overmind.actions.changeShowCount}
            >
              <option value="10">10</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <ul>
              {overmind.state.filteredPosts.map((post, index) => (
                <li key={post.id}>
                  <h4>
                    {index + 1}. {post.title}
                  </h4>
                  {post.body}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }
}

export default connectPostsApp(Posts)
