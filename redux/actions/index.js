import { USER_STATE_CHANGE, USER_POSTS_STATE_CHANGE, USER_FOLLOWING_STATE_CHANGE, USERS_DATA_STATE_CHANGE, USERS_POSTS_STATE_CHANGE, USERS_LIKES_STATE_CHANGE, CLEAR_DATA, THREAD_STATE_CHANGE, THREADS_STATE_CHANGE } from '../constants/index';
import { getFirestore, doc, onSnapshot, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export function clearData() {
  return ((dispatch) => {
      dispatch({type: CLEAR_DATA})
  })
}

export function fetchUser() {
  return (async (dispatch) => {
    const auth = getAuth();
    const firestore = getFirestore();

    try {
      const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
      const snapshot = await getDoc(userDocRef);

      if (snapshot.exists()) {
        dispatch({ type: USER_STATE_CHANGE, currentUser: snapshot.data() });
      } else {
        console.log('User does not exist');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  });
}

export function fetchUserPosts() {
  return async (dispatch) => {
      const auth = getAuth();
      const firestore = getFirestore();

      if (!auth.currentUser) {
          console.error('User not authenticated.');
          // Handle the error here or redirect to authentication.
          return;
      }

      try {
          const userPostsRef = collection(firestore, 'posts', auth.currentUser.uid, 'userPosts');
          const userPostsQuery = query(userPostsRef, orderBy('creation', 'asc'));
          const snapshot = await getDocs(userPostsQuery);

          let posts = snapshot.docs.map((doc) => {
              const data = doc.data();
              const id = doc.id;
              return { id, ...data };
          });
          // console.log(posts)
          dispatch({ type: USER_POSTS_STATE_CHANGE, posts });
      } catch (error) {
          console.error('Error fetching user posts:', error);
      }
  };
} 

export function fetchUserFollowing() {
  return (dispatch) => {
    const auth = getAuth();
    const currentUserUid = auth.currentUser.uid;

    const followingCollection = collection(
      getFirestore(),
      'following',
      currentUserUid,
      'userFollowing'
    );

    onSnapshot(followingCollection, (snapshot) => {
      let following = snapshot.docs.map((doc) => {
        const id = doc.id;
        return id;
      });

      dispatch({ type: USER_FOLLOWING_STATE_CHANGE, following });
      following.forEach((uid) => {
          dispatch(fetchUsersData(uid));
        });
    });
  };
}

export function fetchUsersData(uid) {
  return async (dispatch, getState) => {
    const usersState = getState().usersState;

    if (usersState && usersState.users) {
    const found = getState().usersState.users.some((el) => el.uid === uid);
    if (!found) {
      const firestore = getFirestore();

      try {
        const userDocRef = doc(firestore, 'users', uid);
        const snapshot = await getDoc(userDocRef);

        if (snapshot.exists()) {
          let user = snapshot.data();
          user.uid = snapshot.id;

          dispatch({ type: USERS_DATA_STATE_CHANGE, user });
          dispatch(fetchUsersFollowingPosts(user.uid));
        } else {
          console.log('User does not exist');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
    }
  };
}

export function fetchUsersFollowingPosts(uid) {
  return async (dispatch, getState) => {
    const firestore = getFirestore();

    try {
      const userPostsRef = collection(
        firestore,
        'posts',
        uid,
        'userPosts'
      );
      const userPostsQuery = query(userPostsRef, orderBy('creation', 'asc'));
      const snapshot = await getDocs(userPostsQuery);

      const user = getState().usersState.users.find((el) => el.uid === uid);

      let posts = snapshot.docs.map((doc) => {
        const data = doc.data();
        const id = doc.id;
        return { id, ...data, user };
      });

      for (let i = 0; i < posts.length; i++) {
        dispatch(fetchUsersFollowingLikes(uid, posts[i].id));
      }
      dispatch({ type: USERS_POSTS_STATE_CHANGE, posts, uid });
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };
}

export function fetchUsersFollowingLikes(uid, postId) {
  return (dispatch, getState) => {
    const auth = getAuth();
      const likesDocRef = doc(getFirestore(), 'posts', uid, 'userPosts', postId, 'likes', auth.currentUser.uid);
      onSnapshot(likesDocRef, (snapshot) => {
        if (snapshot && snapshot.ZE && snapshot.ZE.path && snapshot.ZE.path.segments) {
          const postId = snapshot.ZE.path.segments[3];

          let currentUserLike = false;
          if (snapshot.exists()) {
              currentUserLike = true;
          }

          dispatch({ type: USERS_LIKES_STATE_CHANGE, postId, currentUserLike });
        }
      });
  };
}

export function fetchThread(threadId) {
  return async (dispatch) => {
    const firestore = getFirestore();

    try {
      const threadDocRef = doc(firestore, 'threads', threadId);
      const snapshot = await getDoc(threadDocRef);

      if (snapshot.exists()) {
        const threadData = snapshot.data();
        dispatch({ type: THREAD_STATE_CHANGE, threadData });
        // Optionally, dispatch additional actions based on your thread structure
      } else {
        console.log('Thread does not exist');
      }
    } catch (error) {
      console.error('Error fetching thread:', error);
    }
  };
}

export function fetchThreads() {
  return async (dispatch) => {
    const firestore = getFirestore();

    try {
      const threadsCollection = collection(firestore, 'threads');
      const threadsQuery = query(threadsCollection, orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(threadsQuery);

      const threads = snapshot.docs.map((doc) => {
        const data = doc.data();
        const id = doc.id;
        return { id, ...data };
      });

      dispatch({ type: THREADS_STATE_CHANGE, threads });
    } catch (error) {
      console.error('Error fetching threads:', error);
    }
  };
}
