import React, { useState, useEffect } from 'react';
import styled from "styled-components";
import NavItem from './SideNaviItem';
import { items } from './SideNaviLists';
import './SideNavi.css';

function Sidebar() {
	const [activePath, setActivePath] = useState("/");

	const onItemClick = (path) => {
		setActivePath(path); /* Sets activePath which causes rerender which causes CSS to change */
	}

	const onLogOutClick = () => {
		localStorage.removeItem('isLoginElectronApp')
		// props.history.push('/favorite')
		window.location.hash = '#/login';
		window.location.reload();
	}

	return (
		<nav className="gnb">
			<div className="menu-wrap">
				{
					items.map((item, i) =>
						/* Return however many NavItems in array to be rendered */
						<NavItem key={item.name} path={item.path} name={item.name} css={item.css} onItemClick={onItemClick} /* Simply passed an entire function to onClick prop */
							active={item.path === activePath} className={item.path === activePath ? `${item.className} current-menu` : item.className} />
					)
				}
			</div>

			<li style={{ padding: "1rem", fontSize: "1rem", fontWeight: "bold", textAlign: 'center' }}
				onClick={onLogOutClick}
			>
				로그<br />아웃
			</li>
		</nav >
	);
}

export default Sidebar;