import Story from "@/app/story";

export default function Page({ params }: { params: { id: string } }) {
    return (<Story storyId={params.id}></Story>);
}