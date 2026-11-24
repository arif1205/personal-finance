export default function Loading() {
	return (
		<div role='status' aria-label='Loading' className='animate-pulse space-y-6'>
			<div className='h-5 w-32 rounded bg-muted' />
			<div className='h-12 w-2/3 rounded-lg bg-muted' />
			<div className='space-y-px overflow-hidden rounded-xl border'>
				{Array.from({ length: 5 }, (_, i) => (
					<div key={i} className='h-[4.5rem] bg-card' />
				))}
			</div>
		</div>
	);
}
