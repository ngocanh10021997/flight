import {
	faChevronDown,
	faEnvelope,
	faGear,
	faPiggyBank,
	faSave,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useRef, useState } from 'react';

interface WebsiteConfig {
	minPrice: number | null;
	maxPrice: number | null;
	loadingTime: number | null;
}

interface BankInfo {
	bin: string;
	accountNumber: string;
	accountName: string;
}

interface SmtpConfig {
	email: string;
	password: string;
}

interface Bank {
	id: number;
	name: string;
	code: string;
	bin: string;
	shortName: string;
	logo: string;
}

interface BankResponse {
	code: string;
	desc: string;
	data: Bank[];
}

// Mock API functions
const mockApi = {
	fetchWebsiteConfig: async (): Promise<WebsiteConfig> => {
		// Simulate API call
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					minPrice: 10,
					maxPrice: 1000,
					loadingTime: 3,
				});
			}, 500);
		});
	},

	fetchBankInfo: async (): Promise<BankInfo> => {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					bin: 'Example Bank',
					accountNumber: '1234567890',
					accountName: 'John Doe',
				});
			}, 500);
		});
	},

	fetchSmtpConfig: async (): Promise<SmtpConfig> => {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					email: 'admin@example.com',
					password: '********',
				});
			}, 500);
		});
	},

	saveWebsiteConfig: async (config: WebsiteConfig): Promise<void> => {
		// Simulate API call with the config data
		return new Promise((resolve) => {
			console.log('Saving website config:', config);
			setTimeout(resolve, 500);
		});
	},

	saveBankInfo: async (info: BankInfo): Promise<void> => {
		// Simulate API call with the bank info
		return new Promise((resolve) => {
			console.log('Saving bank info:', info);
			setTimeout(resolve, 500);
		});
	},

	saveSmtpConfig: async (config: SmtpConfig): Promise<void> => {
		// Simulate API call with the SMTP config
		return new Promise((resolve) => {
			console.log('Saving SMTP config:', config);
			setTimeout(resolve, 500);
		});
	},
};

const Dashboard: React.FC = () => {
	const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfig>({
		minPrice: null,
		maxPrice: null,
		loadingTime: null,
	});
	const [bankInfo, setBankInfo] = useState<BankInfo>({
		bin: '',
		accountNumber: '',
		accountName: '',
	});
	const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>({
		email: '',
		password: '',
	});
	const [loading, setLoading] = useState(true);
	const [banks, setBanks] = useState<Bank[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const searchInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [websiteData, bankData, smtpData] = await Promise.all([
					mockApi.fetchWebsiteConfig(),
					mockApi.fetchBankInfo(),
					mockApi.fetchSmtpConfig(),
				]);

				// Fetch banks
				const banksResponse = await fetch(
					'https://api.vietqr.io/v2/banks',
				);
				const banksData: BankResponse = await banksResponse.json();
				setBanks(banksData.data);

				setWebsiteConfig(websiteData);
				setBankInfo(bankData);
				setSmtpConfig(smtpData);
			} catch (error) {
				console.error('Error fetching data:', error);
			} finally {
				setLoading(false);
			}
		};

		void fetchData();
	}, []);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (!target.closest('.relative')) {
				setIsDropdownOpen(false);
			}
		};

		if (isDropdownOpen && searchInputRef.current) {
			searchInputRef.current.focus();
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isDropdownOpen]);

	const handleSaveWebsiteConfig = async () => {
		try {
			const configToSave = {
				minPrice: websiteConfig.minPrice ?? 0,
				maxPrice: websiteConfig.maxPrice ?? 0,
				loadingTime: websiteConfig.loadingTime ?? 0,
			};
			await mockApi.saveWebsiteConfig(configToSave);
			alert('Website configuration saved successfully!');
		} catch (error) {
			console.error('Error saving website config:', error);
			alert('Failed to save website configuration');
		}
	};

	const handleSaveBankInfo = async () => {
		try {
			await mockApi.saveBankInfo(bankInfo);
			alert('Bank information saved successfully!');
		} catch (error) {
			console.error('Error saving bank info:', error);
			alert('Failed to save bank information');
		}
	};

	const handleSaveSmtpConfig = async () => {
		try {
			await mockApi.saveSmtpConfig(smtpConfig);
			alert('SMTP configuration saved successfully!');
		} catch (error) {
			console.error('Error saving SMTP config:', error);
			alert('Failed to save SMTP configuration');
		}
	};

	const filteredBanks = banks.filter(
		(bank) =>
			bank.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			bank.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && filteredBanks.length > 0) {
			const firstBank = filteredBanks[0];
			setBankInfo({
				...bankInfo,
				bin: firstBank.bin,
			});
			setIsDropdownOpen(false);
			setSearchTerm('');
		}
	};

	if (loading) {
		return (
			<div className='flex min-h-screen items-center justify-center'>
				<div className='h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900' />
			</div>
		);
	}

	return (
		<div className='mx-auto max-w-4xl p-6'>
			<div className='mb-6 rounded-lg bg-white p-6 shadow-md'>
				<div className='mb-4 flex items-center'>
					<FontAwesomeIcon
						icon={faGear}
						className='mr-2 text-gray-600'
					/>
					<h2 className='text-xl font-semibold'>Cấu Hình Website</h2>
				</div>
				<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
					<div>
						<label className='block text-sm font-medium text-gray-700'>
							Giá Tối Thiểu
						</label>
						<input
							type='number'
							value={websiteConfig.minPrice ?? ''}
							onChange={(e) => {
								const value =
									e.target.value === ''
										? null
										: Number(e.target.value);
								setWebsiteConfig({
									...websiteConfig,
									minPrice: value,
								});
							}}
							placeholder='Nhập giá tối thiểu'
							className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:ring-gray-500'
						/>
					</div>
					<div>
						<label className='block text-sm font-medium text-gray-700'>
							Giá Tối Đa
						</label>
						<input
							type='number'
							value={websiteConfig.maxPrice ?? ''}
							onChange={(e) => {
								const value =
									e.target.value === ''
										? null
										: Number(e.target.value);
								setWebsiteConfig({
									...websiteConfig,
									maxPrice: value,
								});
							}}
							placeholder='Nhập giá tối đa'
							className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:ring-gray-500'
						/>
					</div>
					<div>
						<label className='block text-sm font-medium text-gray-700'>
							Thời Gian Tải (giây)
						</label>
						<input
							type='number'
							value={websiteConfig.loadingTime ?? ''}
							onChange={(e) => {
								const value =
									e.target.value === ''
										? null
										: Number(e.target.value);
								setWebsiteConfig({
									...websiteConfig,
									loadingTime: value,
								});
							}}
							placeholder='Nhập thời gian tải'
							className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:ring-gray-500'
						/>
					</div>
				</div>
				<button
					onClick={handleSaveWebsiteConfig}
					className='mt-4 inline-flex items-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
				>
					<FontAwesomeIcon icon={faSave} className='mr-2' />
					Lưu Cấu Hình
				</button>
			</div>
			<div className='mb-6 rounded-lg bg-white p-6 shadow-md'>
				<div className='mb-4 flex items-center'>
					<FontAwesomeIcon
						icon={faPiggyBank}
						className='mr-2 text-gray-600'
					/>
					<h2 className='text-xl font-semibold'>
						Thông Tin Ngân Hàng
					</h2>
				</div>
				<div className='grid grid-cols-1 gap-4'>
					<div className='relative'>
						<label className='block text-sm font-medium text-gray-700'>
							Tên Ngân Hàng
						</label>
						<div className='relative mt-1'>
							<button
								type='button'
								className='relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500'
								onClick={() =>
									setIsDropdownOpen(!isDropdownOpen)
								}
							>
								{bankInfo.bin ? (
									<div className='flex items-center justify-between'>
										<span>
											{banks.find(
												(bank) =>
													bank.bin === bankInfo.bin,
											)?.shortName || 'Chọn Ngân Hàng'}
										</span>
										<FontAwesomeIcon
											icon={faChevronDown}
											className='ml-2'
										/>
									</div>
								) : (
									'Chọn Ngân Hàng'
								)}
							</button>

							{isDropdownOpen && (
								<div className='absolute z-10 mt-1 max-h-60 w-full overflow-hidden rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
									<div className='sticky top-0 z-10 bg-white px-2 py-1.5'>
										<input
											ref={searchInputRef}
											type='text'
											className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-500 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500'
											placeholder='Tìm kiếm ngân hàng...'
											value={searchTerm}
											onChange={(e) =>
												setSearchTerm(e.target.value)
											}
											onKeyDown={handleSearchKeyDown}
											onClick={(e) => e.stopPropagation()}
										/>
									</div>
									<div className='max-h-48 overflow-auto'>
										{filteredBanks.map((bank) => (
											<div
												key={bank.bin}
												className='flex cursor-pointer items-center px-3 py-2 hover:bg-gray-100'
												onClick={() => {
													setBankInfo({
														...bankInfo,
														bin: bank.bin,
													});
													setIsDropdownOpen(false);
													setSearchTerm('');
												}}
											>
												<img
													src={bank.logo}
													alt={bank.shortName}
													className='mr-2 h-5 w-5'
												/>
												<div>
													<div className='text-sm font-medium'>
														{bank.shortName}
													</div>
													<div className='text-xs text-gray-500'>
														{bank.name}
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
					<div>
						<label className='block text-sm font-medium text-gray-700'>
							Số Tài Khoản
						</label>
						<input
							type='text'
							value={bankInfo.accountNumber}
							onChange={(e) =>
								setBankInfo({
									...bankInfo,
									accountNumber: e.target.value,
								})
							}
							placeholder='Nhập số tài khoản'
							className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:ring-gray-500'
						/>
					</div>
					<div>
						<label className='block text-sm font-medium text-gray-700'>
							Tên Chủ Tài Khoản
						</label>
						<input
							type='text'
							value={bankInfo.accountName}
							onChange={(e) =>
								setBankInfo({
									...bankInfo,
									accountName: e.target.value,
								})
							}
							placeholder='Nhập tên chủ tài khoản'
							className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:ring-gray-500'
						/>
					</div>
				</div>
				<button
					onClick={handleSaveBankInfo}
					className='mt-4 inline-flex items-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
				>
					<FontAwesomeIcon icon={faSave} className='mr-2' />
					Lưu Thông Tin Ngân Hàng
				</button>
			</div>
			<div className='rounded-lg bg-white p-6 shadow-md'>
				<div className='mb-4 flex items-center'>
					<FontAwesomeIcon
						icon={faEnvelope}
						className='mr-2 text-gray-600'
					/>
					<h2 className='text-xl font-semibold'>Cấu Hình SMTP</h2>
				</div>
				<div className='grid grid-cols-1 gap-4'>
					<div>
						<label className='block text-sm font-medium text-gray-700'>
							Email
						</label>
						<input
							type='email'
							value={smtpConfig.email}
							onChange={(e) =>
								setSmtpConfig({
									...smtpConfig,
									email: e.target.value,
								})
							}
							placeholder='Nhập địa chỉ email'
							className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:ring-gray-500'
						/>
					</div>
					<div>
						<label className='block text-sm font-medium text-gray-700'>
							Mật Khẩu
						</label>
						<input
							type='password'
							value={smtpConfig.password}
							onChange={(e) =>
								setSmtpConfig({
									...smtpConfig,
									password: e.target.value,
								})
							}
							placeholder='Nhập mật khẩu'
							className='p mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:ring-gray-500'
						/>
					</div>
				</div>
				<button
					onClick={handleSaveSmtpConfig}
					className='mt-4 inline-flex items-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
				>
					<FontAwesomeIcon icon={faSave} className='mr-2' />
					Lưu Cấu Hình SMTP
				</button>
			</div>
		</div>
	);
};

export default Dashboard;
