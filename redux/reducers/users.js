import { USERS_DATA_STATE_CHANGE, USERS_POSTS_STATE_CHANGE, USERS_LIKES_STATE_CHANGE, CLEAR_DATA, THREAD_STATE_CHANGE, THREADS_STATE_CHANGE } from "../constants"

const initialState = {
    users: [],
    feed: [],
    threads: [],
    usersFollowingLoaded: 0,
}

export const users = (state = initialState, action) => {
    switch (action.type) {
        case USERS_DATA_STATE_CHANGE:
            return {
                ...state,
                users: action.user && action.user.name ? [...state.users, action.user] : state.users,
            }
        case USERS_POSTS_STATE_CHANGE:
            return {
                ...state,
                usersFollowingLoaded: state.usersFollowingLoaded + 1,
                // users: state.users.map(user => user.uid === action.uid ?
                //     { ...user, posts: action.posts } :
                //     user
                // )
                feed: [...state.feed, ...action.posts],
            }
            case USERS_LIKES_STATE_CHANGE:
                return {
                  ...state,
                  feed: state.feed.map(post =>
                    post.id === action.postId
                      ? { ...post, currentUserLike: action.currentUserLike }
                      : post
                  ),
                };
                case THREAD_STATE_CHANGE:
                    return {
                        ...state,
                        threads: [...state.threads, action.threadData],
                    };
                case THREADS_STATE_CHANGE:
                    return {
                        ...state,
                        threads: action.threads,
                    };
        case CLEAR_DATA:
            return initialState
        default:
            return state;
    }
}