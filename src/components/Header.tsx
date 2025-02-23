import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
    return (
        <header className='fixed top-0 left-0 w-full flex bg-white/5 items-center justify-between p-5'>
            <div>
                <h1 className='text-2xl text-blue-500 font-bold'>Consulte</h1>
            </div>
            <nav >
                <ul className='flex items-center text-xl gap-3'>
                    <li><Link href="/">Home</Link></li>
                    <li><Link href="/">About</Link></li>
                    <li><Link href="/">Contact</Link></li>
                    <li><Link className='bg-blue-500 p-2 rounded-md' href="/overview">Overview</Link></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;