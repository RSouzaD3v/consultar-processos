"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from './Container';
import { Menu, LucideArrowRight } from 'lucide-react';

const Header: React.FC = () => {
    const [isClose, setIsClose] = useState<boolean>(true);

    return (
        <div className='flex fixed z-50 top-0 w-full items-center justify-center md:p-0 p-2'>
            <Container>
                <header className='w-full flex my-2 items-center justify-between p-2 border border-white/50 rounded-2xl'>
                    <div>
                        <Image width={40} height={40} src={"/logo.svg"} alt='logo' />
                    </div>
                    <nav className='sm:block hidden'>
                        <ul className='flex items-center gap-5'>
                            <li><Link href="/">Sobre</Link></li>
                            <li><Link href="/">Preços</Link></li>
                            <li><Link href="/">Depoimentos</Link></li>
                            <li><Link href="/">Contatos</Link></li>
                        </ul>
                    </nav>

                    <div className='sm:block hidden'>
                        <Link className='bg-blue-500 p-3 rounded-3xl px-5 text-white' href="/overview">Overview</Link>
                    </div>

                    <div className='block sm:hidden'>
                        <Menu onClick={() => setIsClose(false)} className='cursor-pointer hover:bg-white/10 p-1 rounded-md' size={35}/>
                    </div>

                </header>
                    <div className={`${isClose ? "hidden" : "block"} sm:hidden fixed top-0 right-0 bg-black/50 backdrop-blur-sm w-[150px] justify-center flex items-center h-screen p-10`}>
                        <div onClick={() => setIsClose(true)} className='h-screen cursor-pointer bg-black  flex items-center justify-center p-1'>
                            <LucideArrowRight />
                        </div>
                        <nav>
                            <ul className='flex flex-col p-2 items-center gap-10'>
                                <li><Link href="/">Sobre</Link></li>
                                <li><Link href="/">Preços</Link></li>
                                <li><Link href="/">Depoimentos</Link></li>
                                <li><Link href="/">Contatos</Link></li>
                                <li><Link className='bg-blue-500 p-3 rounded-3xl px-5' href="/overview">Dashboard</Link></li>
                            </ul>
                        </nav>
                    </div>
            </Container>
        </div>
    );
};

export default Header;