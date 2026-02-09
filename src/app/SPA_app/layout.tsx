// src/app/(app)/layout.tsx

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

    // 必要ならここでアプリ全体に適用したいパディングや背景設定をする
    <div className="w-full h-full">
      {children}
    <script src="https://unpkg.com/vconsole@latest/dist/vconsole.min.js"></script>
<script>
  var vConsole = new window.VConsole();
</script>
    </div>
  );
}