import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-background/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8 mb-8 md:mb-12">
          <div className="col-span-2 md:col-span-2">
            <h3 className="font-bold text-xl md:text-2xl mb-3 md:mb-4">BlazeNeuro</h3>
            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 max-w-sm">Next-generation neural solutions for modern applications.</p>
          </div>
          <div className="col-span-1">
            <h4 className="font-semibold mb-3 md:mb-4 text-xs md:text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Docs</a></li>
            </ul>
          </div>
          <div className="col-span-1">
            <h4 className="font-semibold mb-3 md:mb-4 text-xs md:text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
              <li><a href="/blogs" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Press</a></li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-semibold mb-3 md:mb-4 text-xs md:text-sm uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Support</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center mb-6 md:mb-8 overflow-hidden">
          <h2 className="text-[12vw] sm:text-[10vw] md:text-[8vw] lg:text-[7vw] font-bold text-muted-foreground/20 leading-none whitespace-nowrap">
            BlazeNeuro
          </h2>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm text-muted-foreground">
          <p>© 2026 BlazeNeuro. All rights reserved.</p>
          <div className="flex gap-4 md:gap-6">
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
