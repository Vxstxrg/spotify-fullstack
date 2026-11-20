import React from 'react'
import { Container, Step, Stepper, StepLabel, Grid, Card } from '@mui/material';

interface StepWrapperProps {
	activeStep: number;

	children: React.ReactNode;
}
const steps = ['Информация о треке', 'Загрузите обложку', 'Загрузите сам трек']
const StepWrapper: React.FC<StepWrapperProps> = ({ activeStep, children }) => {
	return (
		<Container className=''>
			<Stepper activeStep={activeStep} alternativeLabel>
				{steps.map((step, index) =>
					<Step
						key={index}
						completed={activeStep > index}
					>
						<StepLabel>{step}</StepLabel>
					</Step>
				)}
			</Stepper>
			<Grid container sx={{ justifyContent: 'center', margin: '70px 0', height: 270 }}>
				<Card sx={{width: 600}}>
					{children}
				</Card>
			</Grid>
		</Container >
	);
}
export default StepWrapper;