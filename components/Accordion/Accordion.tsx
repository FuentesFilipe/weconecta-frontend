import { Tooltip } from '@/components/Tooltip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import React from 'react';
import './index.css';



export default function AccordionComponent({ description, expandable = true, children }: {
    description: string,
    expandable: boolean,
    children: React.ReactNode
}) {
    const [expanded, setExpanded] = React.useState(false);

    const handleExpand = () => {
        if (!expandable) return;
        setExpanded(!expanded);
    }

    return (
        <Tooltip title={description} placement="top" children={
            <Accordion
                expanded={expandable ? expanded : false}
                onChange={handleExpand}
                className="custom-accordion"
            >
                <AccordionSummary
                    expandIcon={expandable ? <ExpandMoreIcon /> : <></>}
                    aria-controls="panel1-content"
                    id="panel1-header"
                >
                    <Typography component="span">{description}</Typography>
                </AccordionSummary>
                <AccordionDetails>{children}</AccordionDetails>
            </Accordion>
        } />
    );
}