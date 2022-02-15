import { HashRouter, Routes, Route, useParams } from 'react-router-dom';
import Master from './components/Master';
import Home from './components/Home';
import Profile from './components/Profile';
import Published from './components/Published';
import Saved from './components/Saved';
import NotFound from './components/NotFound';
import Post from './components/Post';
import Accounts from './components/Accounts';
import Login from './components/Login';
import EditProfile from './components/EditProfile';
import ChangePassword from './components/ChangePassword';

const RouteSwitch = () => {
  return (
    <div>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Master />}>
            <Route index element={<Home />} />
            <Route path="p/:postId/" element={<Post />} />
            <Route path=":username/" element={<Profile />}>
              <Route index element={<Published />} />
              <Route path="saved" element={<Saved />} />
            </Route>
            <Route path="accounts/" element={<Accounts />}>
              <Route path="edit/" element={<EditProfile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
    </div>
  );
};

export default RouteSwitch;
