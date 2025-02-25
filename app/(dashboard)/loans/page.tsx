import React from "react";

const LoansPage = () => {
	return (
		<div>
			<main className='flex flex-1 flex-col gap-4 p-4'>
				<div className='grid auto-rows-min gap-4 md:grid-cols-3'>
					<div className='aspect-video rounded-xl bg-muted/50' />
					<div className='aspect-video rounded-xl bg-muted/50' />
					<div className='aspect-video rounded-xl bg-muted/50' />
				</div>
				<div className='min-h-[100vh] flex-1 rounded-xl bg-muted/100 md:min-h-min' />
			</main>
		</div>
	);
};

export default LoansPage;
