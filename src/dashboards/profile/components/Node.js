import { useState, useRef } from "react";
import { Box } from "@mui/material";
import { useWindowSize } from "../../../hooks/useWindowSize";
import QuestionNode from "./QuestionNode";
import RootNode from "./RootNode";
import CategoryNode from "./CategoryNode";
import QaNode from "./QaNode";

const Node = ({
  node,
  onClick,
  onNavigate,
  isActive,
  isChild,
  index,
  total,
}) => {
  const { width, height } = useWindowSize();
  const [isHovered, setIsHovered] = useState(false);
  const nodeRef = useRef(null);

  const handleClick = () => onClick(node.id);

  let x = 0,
    y = 0;
  if (isChild) {
    // Calculate grid-based positioning
    const itemsPerRow = width < 768 ? 2 : 3;
    const gap = width < 768 ? 16 : 24;
    const gridWidth = width < 768 ? width * 0.9 : width * 0.8;
    const itemWidth = (gridWidth - gap * (itemsPerRow - 1)) / itemsPerRow;

    // Calculate row and column position
    const row = Math.floor(index / itemsPerRow);
    const col = index % itemsPerRow;

    // Center the grid and calculate offsets
    x = col * (itemWidth + gap) - gridWidth / 2 + itemWidth / 2;
    y =
      row * (itemWidth * 0.7 + gap) -
      ((Math.ceil(total / itemsPerRow) - 1) * (itemWidth * 0.7 + gap)) / 2;
  }

  const renderNode = () => {
    switch (node.type) {
      case "root":
        return <RootNode node={node} onClick={handleClick} />;
      case "category":
        return <CategoryNode node={node} onClick={handleClick} />;
      case "question":
        return isActive ? (
          <QaNode node={node} onClick={handleClick} onNavigate={onNavigate} />
        ) : (
          <QuestionNode node={node} onClick={handleClick} />
        );
      default:
        return null;
    }
  };

  return (
    <Box
      ref={nodeRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        position: "absolute",
        left: isActive ? "50%" : `calc(50% + ${x}px)`,
        top: isActive ? "50%" : `calc(50% + ${y}px)`,
        transform: "translate(-50%, -50%)",
        transition: "all 0.3s ease-in-out",
        width: width < 768 ? "45vw" : "30vw", // Responsive width
        maxWidth: "400px",
      }}
    >
      {renderNode()}
    </Box>
  );
};

export default Node;
