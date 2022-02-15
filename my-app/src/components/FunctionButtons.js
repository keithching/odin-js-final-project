import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import { useNavigate, useLocation } from 'react-router-dom';

import { showToastMessage } from '../helper';

import { 
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    setDoc,
    updateDoc,
    doc,
    serverTimestamp,
    getDoc,
    deleteDoc,
    getDocs,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';
import { 
    getStorage, 
    ref, 
    uploadBytesResumable, 
    getDownloadURL,
    deleteObject,
    listAll
} from 'firebase/storage';

const FunctionButtons = (props) => {
    let [ 
        currentUser, 
        setCurrentUser, 
        users, 
        setUsers,
        posts,
        setPosts,
        getPublishedPosts,
        getFollowingPosts,
        db,
        storage
    ] = useOutletContext();

    const { post, setCardIsClicked } = props;
    const [ menuIsClicked, setMenuIsClicked ] = useState(false);
    const [ deleteBtnIsClicked, setDeleteBtnIsClicked ] = useState(false);

    // show if the current location isn't the post
    // or if modal exists in DOM
    const isLocationAtPostUrl = () => {
        if (!window.location.href.includes(post.id) || !!document.getElementById(`modal-for-post-${post.id}`)) {
            return false;
        } else {
            return true;
        }
    };

    const callMenu = () => {
        if (!menuIsClicked) {
            setMenuIsClicked(true); 
        } else {
            setMenuIsClicked(false);
        }
    };

    useEffect(() => { // compose the menu to DOM depending on condition
        if (menuIsClicked) {
            let container = createMenuContainer(); // create a common container

            let backdrop = createBackdrop(); // create a common backdrop
            container.appendChild(backdrop);
            
            if (!deleteBtnIsClicked) { // pop up the function menu
                let menu = createFunctionMenu();
                container.appendChild(menu);

                const masterContainer = document.querySelector('.master-container'); // append the menu to master container
                masterContainer.appendChild(container);
            } else { // pop up the delete confirmation menu

                const menuDiv = document.querySelector('.post-menu-menu');
                if (menuDiv) {
                    menuDiv.remove(); // keep the function menu, keep backdrop and container
                }

                const containerDiv = document.querySelector('.post-menu');

                let deleteConfirmMenu = createDeleteConfirmationMenu();
                containerDiv.appendChild(deleteConfirmMenu);

                const masterContainer = document.querySelector('.master-container');
                masterContainer.appendChild(containerDiv);
            }
        } else {
            clearMenuFromDOM();
        }
    }, [menuIsClicked, deleteBtnIsClicked]);


    const clearMenuFromDOM = () => {
        const menuDiv = document.querySelector('.post-menu');
        if (menuDiv) {
            menuDiv.remove();
            document.body.classList.remove('stop-scrolling');
        }
    };

    const createMenuContainer = () => {
        const div = document.createElement('div');
        div.style.top = window.scrollY + 'px';
        div.classList.add('post-menu');

        // https://www.geeksforgeeks.org/how-to-disable-scrolling-temporarily-using-javascript/
        document.body.classList.add('stop-scrolling');
        return div;
    }

    const createBackdrop = () => {
        const div = document.createElement('div');
        div.classList.add('post-menu-backdrop');
        div.addEventListener('click', () => {
            setMenuIsClicked(false);
            setDeleteBtnIsClicked(false);
        });
        return div;
    };

    const createFunctionMenu = () => {
        const div = document.createElement('div');
        div.classList.add('post-menu-menu');

        const subdiv1 = createDeleteFunction();
        const subdiv3 = createCancelFunction();

        div.appendChild(subdiv1);
        if (!isLocationAtPostUrl()) {
            const subdiv2 = createGoToPostFunction();
            div.appendChild(subdiv2);
        }
        div.appendChild(subdiv3);

        return div;
    };


    let navigate = useNavigate();
    let location = useLocation();

    const createDeleteFunction = () => {
        const div = document.createElement('div');
        div.classList.add('post-menu-item');
        if (post.createdBy === currentUser.info.id) { // the post belongs to current user
            div.textContent = 'Delete';
            div.id = 'post-delete-btn';
            div.addEventListener('click', async () => {    
                if (!deleteBtnIsClicked) {
                    setDeleteBtnIsClicked(true);
                } 
                else { // execute delete post 
                    
                    if (location.pathname === '/') { // index page
                        // do nth
                    } else {

                        // close the modal if exists
                        let modal = document.querySelector('.modal');
                        if (modal) {
                            setCardIsClicked(false);
                        }
                        
                        clearMenuFromDOM();
                        navigate(`/${currentUser.info.username}/`); // navigate back to current user's page
                    }
                    
                    deletePost() // delete post
                    .then((res) => {
                        showToastMessage('Post deleted successfully.');
                    })
                    .catch(err => {
                        showToastMessage(`Error trying to delete the post: ${err.message}`);
                    });
                }
            });
        } else { // the post does not belong to current user. no delete functionality
            div.textContent = 'Hello';
            div.id = 'post-delete-btn';
        }
        return div;
    }

    const createGoToPostFunction = () => {
        let div;
        if (!isLocationAtPostUrl()) {
            div = document.createElement('div');
            div.classList.add('post-menu-item');
            div.textContent = 'Go To Post';
            div.id = 'flyer-go-to-post-btn';
            div.addEventListener('click', () => {
                let modal = document.querySelector('.modal');
                if (modal) {
                    window.history.go(0);  // go to the currrent point in history
                } else {
                    navigate(`/p/${post.id}`);
                }
            });

            return div;
        }
    };

    const createCancelFunction = () => {
        const div = document.createElement('div');
        div.classList.add('post-menu-item');
        div.textContent = 'Cancel';
        div.id = 'post-cancel-btn';
        div.addEventListener('click', () => {
            setMenuIsClicked(false);
            setDeleteBtnIsClicked(false);
        });
        return div;
    };

    const createDeleteConfirmationMenu = () => {
        const div = document.createElement('div');
        div.classList.add('post-menu-menu');

        const topDiv = document.createElement('div');
        topDiv.classList.add('post-delete-confirm-menu-top');

        const titleDiv = document.createElement('div');
        titleDiv.textContent = 'Delete Post?'
        titleDiv.classList.add('post-delete-confirm-menu-title');

        const descriptionDiv = document.createElement('div');
        descriptionDiv.textContent = 'Are you sure you want to delete this post?';
        descriptionDiv.classList.add('post-delete-confirm-menu-description');

        topDiv.appendChild(titleDiv);
        topDiv.appendChild(descriptionDiv);
        
        const deleteDiv = createDeleteFunction();
        const cancelDiv = createCancelFunction();

        div.appendChild(topDiv);
        div.appendChild(deleteDiv);
        div.appendChild(cancelDiv);

        return div;
    };

    const deletePost = async () => {
        // delete post doc from posts collection
        const postRef = doc(db, 'posts', post.firebaseId);
        await deleteDoc(postRef)
            .then(() => {
                // console.log('post removed from Firestore!');
            })
            .catch(error => {
                console.log('sth went wrong while trying to delete post...');
            });

        // // update user doc 
        const userRef = doc(db, 'users', currentUser.firebaseId);
        await updateDoc(userRef, {
            'posts.published': currentUser.posts.published.filter(publishedPost => publishedPost.id !== post.id)
        })
            .then(() => {
                // console.log('user updated in Firestore');
            })
            .catch(error => {
                console.log('sth went wrong while trying to update user...');
            });

        // delete post photos from Cloud Storage
        const photoRef = ref(storage, post.photosStorageURL);

        await deleteObject(photoRef)
            .then(() => {
                // console.log('post photo deleted!');
            })
            .catch(error => {
                console.log('sth went wrong while trying to delete post photos...');
            });
    };

    return (
        <div 
            className="post-function-buttons"
            onClick={callMenu}
        >
            <i className="fas fa-ellipsis-h"></i>
        </div>
    );
};


export default FunctionButtons;