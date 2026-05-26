import dynamic from "next/dynamic"

const TrainingClient = dynamic(() =>
  import("@/features/training/components/TrainingClient").then((mod) => ({
    default: mod.TrainingClient,
  }))
)

export default function TrainingPage() {
  return <TrainingClient />
}
