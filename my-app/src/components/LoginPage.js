import Footer from './Footer';
import { useState, useEffect, useRef } from 'react';
import {
    getAuth,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    signOut,
    getRedirectResult
} from 'firebase/auth';

import { showToastMessage, clearToastMessage } from '../helper';

const LoginPage = (props) => {

    const { 
        signIn, 
        users, 
        saveUser, 
        email,
        uid,
        displayName,
        profilePicUrl,
        toggleSignUp,
        handleSignUpClick
    } = props;


    const Brand = () => {
        return (
            <div className="brand">
                TheGram
            </div>
        );
    };

    const LogIn = () => {
        return (
            <div className="user">
                <button onClick={handleSignUpClick} className="signIn-btn">Log In</button>
            </div>
        );
    };

    const SignUpBtn = () => {
        return (
            <div className="login-page-sign-up-container">
                <span onClick={handleSignUpClick}>Sign up with Google</span>
            </div>
        );
    };

    const SignUp = () => {
        // User Name
        const [ userNameInput, setUserNameInput ] = useState(''); 
        const [ userNameValidity, setUserNameValidity ] = useState('');
        const userNameInitialRef = useRef(true);

        const handleUserNameInputChange = (e) => {
            setUserNameInput(e.target.value);
            validateUserNameInputField();
        };

        const validateUserNameInputField = () => {
            const inputField = document.getElementById('sign-up-form-user-name-input');
            userNameInitialRef.current = false;

            // 2 - check validity for username
            // 2.1 - check for emptyness
            if (!inputField.validity.valid) {
                if (inputField.validity.valueMissing) {
                    clearToastMessage();
                    showToastMessage('username field missing value');
                }
                if (inputField.validity.tooShort) {
                    clearToastMessage();
                    showToastMessage('username field at least 5 characters');
                }
                setUserNameValidity(false);
            } else {
                // 2.2 - check duplication for username from Server
                // get all usernames from the server
                let usernamesFromServer = users.map(user => user.info.username);

                if (!!usernamesFromServer.find(usernameFromServer => usernameFromServer === userNameInput)) {
                    showToastMessage('try another username'); // a duplicated username
                    setUserNameValidity(false);
                } else {
                    // valid field
                    // and username not duplicated as checked with server
                    clearToastMessage();
                    setUserNameValidity(true);
                }
            }
        };

        // Full Name
        const [ fullNameInput, setFullNameInput ] = useState(''); 
        const [ fullNameValidity, setFullNameValidity ] = useState('');

        const fullNameInitialRef = useRef(true);

        const handleFullNameInputChange = (e) => {
            setFullNameInput(e.target.value);
            validateFullNameInputField();
        };

        const validateFullNameInputField = () => {
            const inputField = document.getElementById('sign-up-form-full-name-input');
            fullNameInitialRef.current = false;

            // 1 - check validity for full name
            // 1.1 - check for emptyness
            if (!inputField.validity.valid) {
                if (inputField.validity.valueMissing) {
                    clearToastMessage();
                    showToastMessage('full name field missing value');
                }
                setFullNameValidity(false);
            } else {
                clearToastMessage();
                setFullNameValidity(true);
            }
        };


        const signUpUser = (e) => {
            // prevent the form from submitting
            e.preventDefault();

            // get the full name input
            const fullNameInput = document.getElementById('sign-up-form-full-name-input').value;

            // get the username input
            const userNameInput = document.getElementById('sign-up-form-user-name-input').value;

            // save user to the DB                
            const newUser = {
                info: {
                    id: uid,
                    username: userNameInput,
                    nickname: fullNameInput,
                    avatar: null
                },
                posts: {
                    published: [],
                    commented: [],
                    liked: [],
                    saved: []
                },
                comments: {},
                followers: [],
                following: [],
                userLog: []
            };

            saveUser(newUser)
                .then(() => {
                    // refresh the page
                    // https://stackoverflow.com/questions/41481522/how-to-refresh-a-page-using-react-route-link
                    window.location.reload(); // https://www.w3schools.com/jsref/met_loc_reload.asp

                    showToastMessage('sign up successfully');
                })
                .catch(error => {
                    console.log('something went wrong trying to save user to Firestore', error);
                });
    
        };


        const SignUpBtnSubmit = (props) => {
            const { fullNameValidity, userNameValidity } = props;
            const [ btnIsDisabled, setBtnIsDisabled ] = useState(true);

            // if all input fields are validated valid, enable the sign up button
            useEffect(() => {
                if (userNameValidity && fullNameValidity) {
                    setBtnIsDisabled(false);
                } 
                else {
                    setBtnIsDisabled(true);
                }

            }, [userNameValidity, fullNameValidity]);

            return (
                <button 
                    id="login-page-sign-up-btn"
                    disabled={btnIsDisabled}
                >
                    Sign Up
                </button>
            );
        };

        return (
            <div className="sign-up-content">
                <span className="login-page-sign-up-welcome-text">
                    Sign up to see photos and videos from your friends.
                </span>
                <div className="divider"></div>
                
                <div id="google-container">
                    <img src={profilePicUrl} id="google-avatar"/>
                    <div id="google-container-right">
                        <div id="google-display-name">{displayName}</div>
                        <div id="google-email">{email}</div>
                    </div>
                </div>

                <form 
                    noValidate={true} 
                    className="sign-up-form"
                    onSubmit={signUpUser}    
                >

                    {/* Full Name */}
                    <div className="sign-up-form-input-field">
                        <div className="sign-up-form-input-field-left">
                            <span
                                className={ fullNameInput ? 
                                        'sign-up-form-label non-empty' 
                                        : 
                                        'sign-up-form-label empty' 
                                    }
                            >
                                Full Name
                            </span>
                            <input 
                                id="sign-up-form-full-name-input"
                                className={ fullNameInput ? 
                                                fullNameValidity ?
                                                'sign-up-form-input non-empty valid'
                                                :
                                                'sign-up-form-input non-empty'
                                            : 
                                            'sign-up-form-input empty' 
                                        }
                                type="text"
                                autoComplete="off"
                                required={true} 
                                onChange={handleFullNameInputChange}
                                value={fullNameInput}
                            />
                        </div>
                        <div className="sign-up-form-input-field-right">
                            { fullNameInitialRef.current ?
                                null
                                :
                                fullNameValidity ?
                                    <i className="far fa-check-circle"></i> 
                                    :
                                    <i className="far fa-times-circle"></i>
                            }
                        </div>
                    </div>

                    {/* User Name */}
                    <div className="sign-up-form-input-field">
                        <div className="sign-up-form-input-field-left">
                            <span
                                className={ userNameInput ? 
                                        'sign-up-form-label non-empty' 
                                        : 
                                        'sign-up-form-label empty' 
                                    }
                            >
                                Username
                            </span>
                            <input 
                                id="sign-up-form-user-name-input"
                                className={ userNameInput ? 
                                                userNameValidity ?
                                                'sign-up-form-input non-empty valid'
                                                :
                                                'sign-up-form-input non-empty' 
                                            : 
                                            'sign-up-form-input empty' 
                                        }
                                type="text"
                                autoComplete="off"
                                required={true} 
                                minLength="5" 
                                onChange={handleUserNameInputChange}
                                value={userNameInput}
                            />
                        </div>
                        <div className="sign-up-form-input-field-right">
                            { userNameInitialRef.current ?
                                null
                                :
                                userNameValidity ?
                                    <i className="far fa-check-circle"></i> 
                                    :
                                    <i className="far fa-times-circle"></i>
                            }
                        </div>
                    </div>


                    <SignUpBtnSubmit 
                        fullNameValidity={fullNameValidity}
                        userNameValidity={userNameValidity}
                    />
                </form>
            </div>
        );
    };

    return (
        <div className="login-page-container">
            <div className="main">
                <div className="login-page-log-in-container">
                    <Brand />
                    { !toggleSignUp ? 
                        <div>
                            <div className="divider"></div>
                            <LogIn />
                        </div>
                        :
                        <SignUp />
                    }
                </div>
                { !toggleSignUp ? 
                    <SignUpBtn />
                    :
                    null
                }
            </div>
            <Footer />
        </div>
    );
};

export default LoginPage;