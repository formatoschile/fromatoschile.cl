interface ContentPageLayoutProps {
  children: React.ReactNode;
}

const ContentPageLayout: React.FC<ContentPageLayoutProps> = ({ children }) => {
  return (
    <div className="w-full">
      <div className="mx-8 max-w-2xl py-20 sm:mx-auto">{children}</div>
    </div>
  );
};

export default ContentPageLayout;
