import { Link } from "@inertiajs/react";

export default function NavLink({ item }) {
    if (item.children) {
        return (
            <div className="relative group">
                <Link
                    href={item.href}
                    className="text-[#0F8AB1] hover:text-red-600 hover:underline"
                >
                    {item.label}
                </Link>
                <div className="absolute hidden group-hover:block bg-sky-600 shadow-lg rounded mt-2">
                    {item.children.map((child, index) => (
                        <Link
                            key={index}
                            href={child.href}
                            className="block px-4 py-2 hover:bg-gray-100"
                        >
                            {child.label}
                        </Link>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <Link href={item.href} className="text-[#0F8AB1] hover:text-blue-900">
            {item.label}
        </Link>
    );
}
