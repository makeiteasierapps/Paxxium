import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const sampleData = [
    {
        category: 'Personal Background',
        questions: [
            'Can you share a bit about your upbringing and how it has influenced your approach to parenting and work-life balance?',
            'How has being a single parent impacted your daily routine and decision-making process?',
            "What significant life events have shaped your current goals and aspirations, particularly in pursuing a master's degree in educational psychology?",
            'In what ways do your interests in gardening and painting contribute to your overall well-being and stress management?',
            'How do you prioritize your health goals while juggling parenting, work, and educational pursuits?',
            'What strategies have you found effective in maintaining a healthy work-life balance as a school counselor and single parent?',
            'How do you stay motivated to pursue your educational aspirations despite the challenges of balancing multiple responsibilities?',
            'What advice would you give to other single parents looking to improve their diet and incorporate regular exercise into their routine?',
        ],
    },
    {
        category: 'Education and Career',
        questions: [
            'What motivated you to pursue a career as a school counselor?',
            'Can you share more about your educational journey and how it has led you to where you are today?',
            'What are your career goals in the field of educational psychology?',
            "How do you envision balancing your job as a school counselor with pursuing a master's degree?",
            'Have you considered any specific career advancements or opportunities within the field of educational psychology?',
            'What challenges do you anticipate facing in balancing your parenting responsibilities with your career and educational aspirations?',
            'How do you plan to stay motivated and focused on your personal health and education goals while juggling multiple responsibilities?',
            'Are there any specific areas within educational psychology that you are particularly passionate about or interested in exploring further?',
        ],
    },
    {
        category: 'Physical and Mental Health',
        questions: [
            'How would you describe your current diet and eating habits?',
            'Do you engage in regular physical activity or exercise? If so, what does your routine look like?',
            'Have you noticed any changes in your mental health or emotional well-being recently?',
            'Are there any persistent health issues or disabilities that you are managing?',
            'How do you cope with stress and maintain a work-life balance as a single parent and school counselor?',
            'What strategies do you use to stay motivated in pursuing your health and educational goals?',
            'Have you considered seeking professional support or counseling to address any challenges you are facing?',
            'How can we support you in finding resources or assistance to help you achieve a better work-life balance and overall well-being?',
        ],
    },
    {
        category: 'Interests and Hobbies',
        questions: [
            'What inspired you to start gardening and painting?',
            'How do you find time to pursue your hobbies amidst your busy schedule?',
            'Have you considered involving your daughter in your gardening or painting activities?',
            'What benefits do you experience from engaging in gardening and painting?',
            'Are there any specific projects or techniques you would like to learn more about in gardening or painting?',
            'How do your hobbies contribute to your overall well-being and stress relief?',
            'Have you thought about joining a gardening or painting community to connect with like-minded individuals?',
            'In what ways do your hobbies help you stay motivated in achieving your health and educational goals?',
            'Do you have any future plans or goals related to your gardening and painting interests?',
            'How do you see your hobbies evolving as you continue to pursue your educational aspirations?',
        ],
    },
    {
        category: 'Current Life Situation',
        questions: [
            'How do you currently manage your time between parenting, work, hobbies, health goals, and educational aspirations?',
            'What specific challenges do you face in balancing all these responsibilities?',
            'Are there any specific strategies or routines that have helped you maintain a work-life balance?',
            'How do you ensure quality time with your daughter while pursuing your educational and career goals?',
            'What support systems or resources do you rely on to help you juggle all these responsibilities?',
            'In what ways do you prioritize self-care and personal well-being amidst your busy schedule?',
            'What motivates you to stay focused on your health and education goals despite the challenges?',
            'How do you handle stress and maintain a positive mindset during demanding times?',
            'Have you considered seeking professional guidance or support to help you navigate these various responsibilities?',
            'What advice or tips would you give to other single parents facing similar challenges?',
        ],
    },
    {
        category: 'Social Relationships',
        questions: [
            'How do you involve your daughter in your hobbies like gardening and painting?',
            'What support do you have from family or friends in balancing your parenting responsibilities and work as a school counselor?',
            'Have you considered joining any parent support groups or community programs to connect with other single parents?',
            'How do you maintain communication with your friends while juggling your various responsibilities?',
            'In what ways do you prioritize self-care and social connections to stay motivated in achieving your health and educational goals?',
        ],
    },
    {
        category: 'Goals and Aspirations',
        questions: [
            'What are your short-term goals in terms of improving your diet and incorporating regular exercise?',
            'How do you envision balancing parenting, your job as a school counselor, hobbies, health goals, and educational aspirations?',
            "What motivates you to pursue a master's degree in educational psychology?",
            'In what ways do you see your interests in gardening and painting aligning with your long-term goals?',
            'What specific challenges do you face in maintaining work-life balance as a single parent?',
            'How do you plan to stay motivated in achieving your personal health and education goals?',
            'What advice or strategies would you find most helpful in effective parenting as a single parent?',
        ],
    },
];

const transformDataToTree = (data) => {
    const root = { name: 'Root', children: [], parent: null };

    data.forEach((category) => {
        const categoryNode = {
            name: category.category,
            children: [],
            parent: root,
        };
        category.questions.forEach((question) => {
            const questionNode = {
                name: question,
                children: [],
                parent: categoryNode,
            };
            categoryNode.children.push(questionNode);
        });
        root.children.push(categoryNode);
    });

    return root;
};

const Node = ({
    node,
    onClick,
    depth = 0,
    index = 0,
    total = 1,
    expandedNodes,
    setExpandedNodes,
}) => {
    const isExpanded = expandedNodes.includes(node);

    const handleClick = () => {
        if (isExpanded) {
            setExpandedNodes(expandedNodes.filter((n) => n !== node));
        } else {
            setExpandedNodes([...expandedNodes, node]);
        }
        onClick(node);
    };

    if (node.name === 'Root') node.name = 'Personalized Questions';

    let angle, x, y;
    const radius = 150 * (depth + 1);

    angle = (index / total) * 2 * Math.PI - Math.PI / 2;

    x = radius * Math.cos(angle);
    y = radius * Math.sin(angle);

    const isQuestion = !node.children || node.children.length === 0;

    return (
        <Box
            sx={{
                position: 'absolute',
                left: depth === 0 ? '50%' : `calc(50% + ${x}px)`,
                top: depth === 0 ? '50%' : `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)',
            }}
        >
            <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClick}
                style={{
                    borderRadius: isQuestion ? '10px' : '50%',
                    background: '#3f51b5',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: isQuestion ? 250 : 100,
                    height: isQuestion ? 100 : 100,
                    cursor: 'pointer',
                    margin: 20,
                    position: 'relative',
                    padding: isQuestion ? '10px' : '0',
                    textAlign: isQuestion ? 'center' : 'left',
                }}
            >
                <Typography
                    variant="body2"
                    sx={{ textAlign: 'center', padding: '5px' }}
                >
                    {node.name}
                </Typography>
            </motion.div>

            {isExpanded && node.children && (
                <AnimatePresence>
                    {node.children.map((child, idx) => (
                        <Node
                            key={idx}
                            node={child}
                            onClick={onClick}
                            depth={depth + 1}
                            index={idx}
                            total={node.children.length}
                            expandedNodes={expandedNodes}
                            setExpandedNodes={setExpandedNodes}
                        />
                    ))}
                </AnimatePresence>
            )}
        </Box>
    );
};

const GraphComponent = () => {
    const treeData = transformDataToTree(sampleData);
    const [activeNode, setActiveNode] = useState(treeData);
    const [expandedNodes, setExpandedNodes] = useState([treeData]);

    const handleNodeClick = (node) => {
        if (node === activeNode && node.parent) {
            setActiveNode(node.parent);
        } else {
            setActiveNode(node);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                width: '100%',
                position: 'relative',
                border: '1px solid red',
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <Node
                    node={activeNode}
                    onClick={handleNodeClick}
                    expandedNodes={expandedNodes}
                    setExpandedNodes={setExpandedNodes}
                />
            </Box>
        </Box>
    );
};

export default GraphComponent;
