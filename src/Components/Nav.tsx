import React, {useState, useEffect} from 'react';
import IconButton from '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import '../css/Nav.css';
import { Navigation, SharedElement } from 'react-motion-router';

interface NavProps {
    navigation: Navigation;
}

export function Nav(props: NavProps) {
    const [currentPath, setCurrentPath] = useState(props.navigation.location.pathname);
    const [mounted, setMounted] = useState(false);

    window.addEventListener('page-animation-end', () => {
        if (!mounted) return;
        setCurrentPath(props.navigation.location.pathname);
    }, {once: true});

    useEffect(() => {
        setMounted(true);

        return () => setMounted(false);
    }, []);
    const safeAreaPadding = `${window.outerHeight - window.innerHeight}px`;
    const isHome = currentPath === '/';
    const isSettings = currentPath === '/settings';
    return (
        <div className="nav-wrap">
            <div className="fab" style={{transform: `translate(-50%, calc(-${safeAreaPadding} - 20px))`}}>
                <IconButton disableRipple onClick={() => props.navigation.navigate('/history')} style={{zIndex: 1}}>
                    <HistoryIcon style={{color: 'white'}} />
                </IconButton>
                <SharedElement id="nav-fab-bg" config={{
                    easingFunction: 'cubic-bezier(0,0,1,1)'
                }}>
                    <div className="bg"></div>                
                </SharedElement>
            </div>
            <nav className="nav">
                <div
                    className={`home ${isHome ? 'active' : ''}`}
                    style={{
                        transform: `translateY(-${safeAreaPadding})`
                    }
                }>
                    <IconButton disableRipple onClick={() => {
                        if (!isHome) {
                            props.navigation.goBack();
                        }
                    }}>
                        <HomeIcon />
                    </IconButton>
                    <small>Home</small>
                </div>
                
                <div
                    className={`settings ${isSettings ? 'active' : ''}`}
                    style={{
                        transform: `translateY(-${safeAreaPadding})`
                    }
                }>
                    <IconButton disableRipple onClick={() => props.navigation.navigate('/settings')}>
                        <SettingsIcon />
                    </IconButton>
                    <small>Settings</small>
                </div>
                <div className="bg"></div>
            </nav>
        </div>
    );
}

export default Nav;