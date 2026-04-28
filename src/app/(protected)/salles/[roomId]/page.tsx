import { redirect } from "next/navigation"

interface Props {
  params: Promise<{ roomId: string }>
}

export default async function RoomPage({ params }: Props) {
  const { roomId } = await params
  redirect(`/salles/${roomId}/general`)
}
