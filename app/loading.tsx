import { Loading } from "@/components/ui/loading";

export default function GlobalLoading() {
	return (
		<div className='fixed inset-0 bg-background/80 backdrop-blur-sm'>
			<div className='flex h-full w-full items-center justify-center'>
				<Loading size='lg' />
			</div>
		</div>
	);
}
