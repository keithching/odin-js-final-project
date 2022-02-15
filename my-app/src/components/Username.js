import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Username = (props) => {
    const { className, username } = props;

    const navigateToUserPage = () => {
        // history push state to the post Id url
        window.history.pushState({user: `${username}`}, '', `#/${username}/`);
        window.history.go(0);
    }

    return (

        <div className={className} onClick={navigateToUserPage}>
            {username} 
        </div>
    );
};

export default Username;