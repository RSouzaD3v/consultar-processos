import Link from "next/link";
import { menuItems } from "../_components/Sidebar";

export default function OverviewPage() { 
    const overviewItems = menuItems.filter((item) => item.description !== null);
    
    return (
        <div className="md:ml-[200px] ml-[50px] p-5">
            <h1 className="text-3xl my-5 font-bold">Overview</h1>
            <div className="grid md:grid-cols-4 grid-rows-2 gap-5">
                {overviewItems.map((item, index) => (
                    <Link href={item.href} key={index} className="bg-gray-800 p-5 rounded-md 
                    transition ease-in-out duration-200 hover:bg-gray-700 hover:scale-105">
                        <div className="flex items-center gap-2 mb-2">
                            <item.icon size={25} />
                            <h3 className="text-xl font-bold">{item.name}</h3>
                        </div>
                        <p>{item.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};