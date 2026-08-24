import { StrategyWorkspaceWrapper } from '@/components/workspace/strategy'

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StrategyWorkspaceWrapper>
      {children}
    </StrategyWorkspaceWrapper>
  )
}
