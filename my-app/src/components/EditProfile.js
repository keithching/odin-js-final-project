import { useOutletContext } from 'react-router';
import { NavLink, Outlet } from 'react-router-dom';
import Avatar from './Avatar';
import { useState } from 'react';
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
import ChangeProfilePhoto from './ChangeProfilePhoto';

const EditProfile = () => {

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
        storage,
        signIn,
        signOutUser,
        username,
        profilePicUrl,
        isSignedIn
    ] = useOutletContext();
    
    // store the user edit info as state (temporary variables)
    const [ avatar, setAvatar ] = useState(currentUser.info.avatar);
    const [ nicknameInput, setNicknameInput ] = useState(currentUser.info.nickname);
    const [ usernameInput, setUsernameInput ] = useState(currentUser.info.username);

    const showToastMessage = (message) => {
        const toast = document.createElement('div');
        toast.classList.add('edit-account-toast-message');
        toast.textContent = message;

        const container = document.querySelector('.edit-account-container');
        container.appendChild(toast);

        setTimeout(() => {
            const toastDiv = document.querySelector('.edit-account-toast-message');
            toastDiv.remove();
        }, 2000);
    };
    
    const showError = () => {
        let nicknameInputField = document.getElementById('editAccountNicknameInput');
        let usernameInputField = document.getElementById('editAccountUsernameInput');
        let nicknameErrorField = document.querySelector('#editAccountNicknameInput + span.error');
        let usernameErrorField = document.querySelector('#editAccountUsernameInput + span.error');

        if (nicknameInputField.validity.valid) {
            nicknameErrorField.textContent = '';
        }
        if (usernameInputField.validity.valid) {
            usernameErrorField.textContent = '';
        }

        if (!nicknameInputField.validity.valid || !usernameInputField.validity.valid) {
            if (!nicknameInputField.validity.valid) {
                if (nicknameInputField.validity.valueMissing) {
                    nicknameErrorField.textContent = 'value missing';
                }
                
                else if (nicknameInputField.validity.tooShort) {
                    nicknameErrorField.textContent = 'min. 5 characters is required';
                }
    
                else {
                    nicknameErrorField.textContent = 'whoops...';
                }
            }
    
            if (!usernameInputField.validity.valid) {
                if (usernameInputField.validity.valueMissing) {
                    usernameErrorField.textContent = 'value missing';
                }
    
                else if (usernameInputField.validity.tooShort) {
                    usernameErrorField.textContent = 'min. 5 characters is required';
                }
            }
        }
    };


    // when changes is made to the input fields, update the states
    const handleChange = (e) => {
        if (e.target.id === 'editAccountNicknameInput') {
            setNicknameInput(e.target.value);
        } else if (e.target.id === 'editAccountUsernameInput') {
            setUsernameInput(e.target.value);
        }

        // activate the submit button if any change happened
        document.getElementById('editAccountSubmitBtn').classList.remove('disabled');

        // error handling
        showError();
    };

    // when submit is clicked, update user's info
    const submitChange = async (e) => {
        e.preventDefault();

        let nicknameInputField = document.getElementById('editAccountNicknameInput');
        let usernameInputField = document.getElementById('editAccountUsernameInput');

        if (nicknameInputField.validity.valid && usernameInputField.validity.valid) {
            const currentUserRef = doc(db, 'users', currentUser.firebaseId);
        
            await updateDoc(currentUserRef, {
                "info.username": usernameInputField.value,
                "info.nickname": nicknameInputField.value
            })
            .then(result => {
                // show to user
                showToastMessage('changes committed');
            })
            .catch(error => {
                console.log('error updating user info...', error);
            });
        } else {
            showError();
            showToastMessage('something went wrong...');
        }
    };

    return (
        <div >
             <form noValidate={true}>
                    <div className="edit-account-right-row">
                        <div className="edit-account-right-row-left">
                            <Avatar 
                                className="edit-account-avatar"
                                avatar={currentUser.info.avatar}
                                currentUser={currentUser}
                                db={db}
                                storage={storage}
                                clickable={true}
                            />
                        </div>
                        <div className="edit-account-right-row-right">
                            <span id="edit-account-username">{usernameInput}</span>
                            <ChangeProfilePhoto 
                                avatar={currentUser.info.avatar}
                                currentUser={currentUser}
                                db={db}
                                storage={storage}
                            />
                        </div>
                    </div>
                    <div className="edit-account-right-row">
                        <div className="edit-account-right-row-left">
                            <label htmlFor="editAccountNicknameInput">Name</label>
                        </div>
                        <div className="edit-account-right-row-right">
                            <input 
                                placeholder="Name" 
                                value={nicknameInput} 
                                id="editAccountNicknameInput"
                                onChange={handleChange}
                                autoComplete="off"
                                minLength="5"
                                required={true}
                            />
                            <span className="error"></span>
                        </div>
                    </div>
                    <div className="edit-account-right-row">
                        <div className="edit-account-right-row-left">
                            <label htmlFor="editAccountUsernameInput">Username</label>
                        </div>
                        <div className="edit-account-right-row-right">
                            <input 
                                placeholder="Username" 
                                value={usernameInput} 
                                id="editAccountUsernameInput"
                                onChange={handleChange}
                                autoComplete="off"
                                minLength="5"
                                required={true}
                            />
                            <span className="error"></span>
                        </div>
                    </div>
                    <div className="edit-account-right-row">
                        <div className="edit-account-right-row-right">
                            <button 
                                id="editAccountSubmitBtn"
                                className="disabled"
                                onClick={submitChange}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
            </form>
        </div>
    );
};

export default EditProfile;