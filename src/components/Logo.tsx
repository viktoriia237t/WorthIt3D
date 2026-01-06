import { Box } from "lucide-react";


const Logo = () => (
<div className="flex items-center justify-center pb-6 gap-3 group cursor-pointer w-full">
    {/* Іконка */}
    <div className="relative">
        {/* Створюємо ефект світіння */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-success rounded-lg blur opacity-30 group-hover:opacity-50 transition opacity"></div>
        <div className="relative p-2 bg-background/80 backdrop-blur-md rounded-lg border border-white/10 flex items-center justify-center">
            <Box className="text-primary" size={24} strokeWidth={1.5} />

            <div className="absolute -bottom-1.5 -right-1.5 bg-background rounded-full p-[1.5px]">
                <div className="flex items-center justify-center w-4 h-4 bg-gradient-to-tr from-success to-emerald-400 rounded-full shadow-sm">
                    <span className="text-[10px] font-black text-white leading-none">$</span>
                </div>
            </div>
        </div>
    </div>

    {/* Типографіка */}
    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center">
        WorthIt
        <span className="px-1 ml-1 rounded-md bg-primary/20 text-primary font-black text-sm border border-primary/30">3D</span>
    </h1>
</div>
);

export default Logo;