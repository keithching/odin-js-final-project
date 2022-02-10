import Footer from './Footer';
import { useState, useEffect, useRef } from 'react';

const LoginPage = (props) => {

    const { signIn, users, getAuth, getRedirectResult, GoogleAuthProvider, saveUser } = props;

    const [ signUpIsClicked, setSignUpIsClicked ] = useState(false);

    const toggleSignUp = () => {
        setSignUpIsClicked(true);
    }

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
                <button onClick={signIn} className="signIn-btn">Log In</button>
            </div>
        );
    };

    const SignUpBtn = () => {
        return (
            <div className="login-page-sign-up-container">
                <span onClick={signIn}>Sign up with Google</span>
            </div>
        );
    };

    // from google user
    const [ displayName, setDisplayName ] = useState('');
    const [ photoURL, setPhotoURL ] = useState('');
    const [ email, setEmail ] = useState('');
    const [ uid, setUid ] = useState('');

    useEffect(() => {
        // get the google authentication 
        const auth = getAuth();

        getRedirectResult(auth)
            .then((result) => {
                if (result) {
                    toggleSignUp();
                }

                const user = result.user;
                // console.log(user);

                setDisplayName(user.displayName);
                setPhotoURL(user.photoURL);
                setEmail(user.email);

                // get the uid from this google sign-in
                setUid(user.uid);

                // look if this uid already exist in the Server or not
                const uidsFromServer = users.map(user => user.info.id);

                if (uidsFromServer.find(uidFromServer => uidFromServer === user.uid)) {
                    console.log('uid duplicated');
                    // duplicated. not to register this user into the server

                    // pull up the user log-in UI for this google account 

                } else {
                    // register this user.
                    console.log('uid not duplicated');
                }
            })
            .catch(error => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
                // ...
            });
    });

    const SignUp = () => {

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

            console.log(newUser);
            saveUser(newUser)
                .then(() => {
                    // load the data , enter the app

                    // refresh the page
                    // https://stackoverflow.com/questions/41481522/how-to-refresh-a-page-using-react-route-link
                    window.location.reload(); // https://www.w3schools.com/jsref/met_loc_reload.asp
                    
                })
                .catch(error => {
                    console.log('something went wrong trying to save user to Firestore', error);
                });
    
        };

        const FullNameInput = () => {
            const [ fullNameInput, setFullNameInput ] = useState(''); 
            const [ fullNameValidity, setFullNameValidity ] = useState('');
            const initialRef = useRef(true);

            const handleFullNameInputChange = (e) => {
                setFullNameInput(e.target.value);
                validateInputField();
            };

            const validateInputField = () => {
                const inputField = document.getElementById('sign-up-form-full-name-input');
                initialRef.current = false;

                // 1 - check validity for full name
                // 1.1 - check for emptyness
                if (!inputField.validity.valid) {
                    if (inputField.validity.valueMissing) {
                        console.log('missing value');
                    }
                    setFullNameValidity(false);
                } else {
                    setFullNameValidity(true);
                }
            };

            return (
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
                        { initialRef.current ?
                            null
                            :
                            fullNameValidity ?
                                <i className="far fa-check-circle"></i> 
                                :
                                <i className="far fa-times-circle"></i>
                        }
                    </div>
                </div>
            );
        };

        const UserNameInput = () => {
            const [ userNameInput, setUserNameInput ] = useState(''); 
            const [ userNameValidity, setUserNameValidity ] = useState('');
            const initialRef = useRef(true);

            const handleUserNameInputChange = (e) => {
                setUserNameInput(e.target.value);
            };

            useEffect(() => {
                initialRef.current = false;

                const inputField = document.getElementById('sign-up-form-user-name-input');

                const validateInput = () => {
                    // 2 - check validity for username
                    // 2.1 - check for emptyness
                    if (!inputField.validity.valid) {
                        if (inputField.validity.valueMissing) {
                            console.log('missing username value');
                        }
                        if (inputField.validity.tooShort) {
                            console.log('min 5 characters');
                        }
                        setUserNameValidity(false);
                    } else {
                        // 2.2 - check duplication for username from Server
                        // get all usernames from the server
                        let usernamesFromServer = users.map(user => user.info.username);
                        console.log({usernamesFromServer});
                        console.log(userNameInput);
                        if (!!usernamesFromServer.find(usernameFromServer => usernameFromServer === userNameInput)) {
                            console.log('username duplicated');
                            setUserNameValidity(false);
                        } else {
                            console.log('username not duplicated');
                            setUserNameValidity(true);
                        }
                    }
                };

                inputField.addEventListener('change', validateInput);

                return () => inputField.removeEventListener('change', validateInput);
            });

            return (
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
                        { initialRef.current ?
                            null
                            :
                            userNameValidity ?
                                <i className="far fa-check-circle"></i> 
                                :
                                <i className="far fa-times-circle"></i>
                        }
                    </div>
                </div>
            );
        };

        const SignUpBtnSubmit = () => {
            const [ btnIsDisabled, setBtnIsDisabled ] = useState(true);

            // if all input fields are validated valid, enable the sign up button
            useEffect(() => {
                const fullNameInputField = document.getElementById('sign-up-form-full-name-input');
                const userNameInputField = document.getElementById('sign-up-form-user-name-input');
                
                // this part is buggy. 
                // set state is asynchronous, so this class "listening" cannot actually catch up
                const setBtnStatus = () => {
                    if (fullNameInputField.classList.contains('valid') && userNameInputField.classList.contains('valid')) {
                        setBtnIsDisabled(false);
                    } else {
                        setBtnIsDisabled(true);
                    }
                }

                fullNameInputField.addEventListener('change', setBtnStatus);
                userNameInputField.addEventListener('change', setBtnStatus);

                return () => {
                    fullNameInputField.removeEventListener('change', setBtnStatus);
                    userNameInputField.removeEventListener('change', setBtnStatus);
                }
            });

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
                    <img src={photoURL} id="google-avatar"/>
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
                    <FullNameInput />
                    <UserNameInput />
                    <SignUpBtnSubmit />
                </form>
            </div>
        );
    };

    return (
        <div className="login-page-container">
            <div className="main">
                <div className="login-page-log-in-container">
                    <Brand />
                    { !signUpIsClicked ? 
                        <div>
                            <div className="divider"></div>
                            <LogIn />
                        </div>
                        :
                        <SignUp />
                    }
                </div>
                { !signUpIsClicked ? 
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