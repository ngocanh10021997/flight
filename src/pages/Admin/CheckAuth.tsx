import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';

const CheckAuth: React.FC = () => {
	const [isMobile, setIsMobile] = useState(false);
	useEffect(() => {
		window.addEventListener('resize', () => {
			setIsMobile(window.innerWidth < 768);
		});
		return () => {
			window.removeEventListener('resize', () => {});
		};
	}, []);

	return (
		<>
			<Helmet>
				<title>Admin | Săn Vé Giá Rẻ 24h</title>
				<link
					rel='shortcut icon'
					href='https://github.com/ovftank.png'
					type='image/png'
				/>
			</Helmet>
			{isMobile ? (
				<div className='flex h-screen items-center justify-center text-center text-2xl'>
					Vui lòng sử dụng máy tính
				</div>
			) : (
				<Outlet />
			)}
		</>
	);
};

export default CheckAuth;
