const coolVar = (
	<DynamicImage>
		{async () => {
			const yes = 123;
			return <div>{yes}</div>;
		}}
	</DynamicImage>
);
