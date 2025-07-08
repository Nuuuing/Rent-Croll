import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#23243a] to-[#2e2f4d] p-8">
      <div className="w-full max-w-2xl flex flex-col items-center justify-center gap-12">
        <Link href="/lotte">
          <div className="flex flex-col items-center gap-2 px-10 py-8 rounded-2xl font-extrabold text-2xl shadow-xl transition-all duration-300 border-2 bg-[#282a45] border-[#35365a] text-blue-200 hover:bg-blue-500 hover:text-white hover:scale-105 cursor-pointer">
            롯데렌터카
          </div>
        </Link>
      </div>
    </div>
  );
}
