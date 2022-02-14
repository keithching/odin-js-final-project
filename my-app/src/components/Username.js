import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Username = (props) => {
    const { className, username } = props;

    return (

        <div className={className}>
            <Link to={`${username}/`}>
                {username || 'default'} 
            </Link>
        </div>
    );
};

export default Username;