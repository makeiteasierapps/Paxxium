import { useState, useContext } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomTextField } from '../styledProfileComponents';
import { ProfileContext } from '../../../contexts/ProfileContext';
const sampleData = [
    {
        category: 'Personal Background',
        questions: [
            {
                question:
                    'Can you share a bit about your upbringing and how it has influenced your approach to parenting and work-life balance?',
                answer: 'Hi How arte you',
            },
            {
                question:
                    'How has being a single parent impacted your daily routine and decision-making process?',
                answer: '',
            },
            {
                question:
                    "What significant life events have shaped your current goals and aspirations, particularly in pursuing a master's degree in educational psychology?",
                answer: '',
            },
            {
                question:
                    'In what ways do your interests in gardening and painting contribute to your overall well-being and stress management?',
                answer: '',
            },
            {
                question:
                    'How do you prioritize your health goals while juggling parenting, work, and educational pursuits?',
                answer: '',
            },
            {
                question:
                    'What strategies have you found effective in maintaining a healthy work-life balance as a school counselor and single parent?',
                answer: '',
            },
            {
                question:
                    'How do you stay motivated to pursue your educational aspirations despite the challenges of balancing multiple responsibilities?',
                answer: '',
            },
            {
                question:
                    'What advice would you give to other single parents looking to improve their diet and incorporate regular exercise into their routine?',
                answer: '',
            },
        ],
    },
    {
        category: 'Education and Career',
        questions: [
            {
                question:
                    'What motivated you to pursue a career as a school counselor?',
                answer: '',
            },
            {
                question:
                    'Can you share more about your educational journey and how it has led you to where you are today?',
                answer: '',
            },
            {
                question:
                    'What are your career goals in the field of educational psychology?',
                answer: '',
            },
            {
                question:
                    "How do you envision balancing your job as a school counselor with pursuing a master's degree?",
                answer: '',
            },
            {
                question:
                    'Have you considered any specific career advancements or opportunities within the field of educational psychology?',
                answer: '',
            },
            {
                question:
                    'What challenges do you anticipate facing in balancing your parenting responsibilities with your career and educational aspirations?',
                answer: '',
            },
            {
                question:
                    'How do you plan to stay motivated and focused on your personal health and education goals while juggling multiple responsibilities?',
                answer: '',
            },
            {
                question:
                    'Are there any specific areas within educational psychology that you are particularly passionate about or interested in exploring further?',
                answer: '',
            },
        ],
    },
    {
        category: 'Physical and Mental Health',
        questions: [
            {
                question:
                    'How would you describe your current diet and eating habits?',
                answer: '',
            },
            {
                question:
                    'Do you engage in regular physical activity or exercise? If so, what does your routine look like?',
                answer: '',
            },
            {
                question:
                    'Have you noticed any changes in your mental health or emotional well-being recently?',
                answer: '',
            },
            {
                question:
                    'Are there any persistent health issues or disabilities that you are managing?',
                answer: '',
            },
            {
                question:
                    'How do you cope with stress and maintain a work-life balance as a single parent and school counselor?',
                answer: '',
            },
            {
                question:
                    'What strategies do you use to stay motivated in pursuing your health and educational goals?',
                answer: '',
            },
            {
                question:
                    'Have you considered seeking professional support or counseling to address any challenges you are facing?',
                answer: '',
            },
            {
                question:
                    'How can we support you in finding resources or assistance to help you achieve a better work-life balance and overall well-being?',
                answer: '',
            },
        ],
    },
    {
        category: 'Interests and Hobbies',
        questions: [
            {
                question: 'What inspired you to start gardening and painting?',
                answer: '',
            },
            {
                question:
                    'How do you find time to pursue your hobbies amidst your busy schedule?',
                answer: '',
            },
            {
                question:
                    'Have you considered involving your daughter in your gardening or painting activities?',
                answer: '',
            },
            {
                question:
                    'What benefits do you experience from engaging in gardening and painting?',
                answer: '',
            },
            {
                question:
                    'Are there any specific projects or techniques you would like to learn more about in gardening or painting?',
                answer: '',
            },
            {
                question:
                    'How do your hobbies contribute to your overall well-being and stress relief?',
                answer: '',
            },
            {
                question:
                    'Have you thought about joining a gardening or painting community to connect with like-minded individuals?',
                answer: '',
            },
            {
                question:
                    'In what ways do your hobbies help you stay motivated in achieving your health and educational goals?',
                answer: '',
            },
            {
                question:
                    'Do you have any future plans or goals related to your gardening and painting interests?',
                answer: '',
            },
            {
                question:
                    'How do you see your hobbies evolving as you continue to pursue your educational aspirations?',
                answer: '',
            },
        ],
    },
    {
        category: 'Current Life Situation',
        questions: [
            {
                question:
                    'How do you currently manage your time between parenting, work, hobbies, health goals, and educational aspirations?',
                answer: '',
            },
            {
                question:
                    'What specific challenges do you face in balancing all these responsibilities?',
                answer: '',
            },
            {
                question:
                    'Are there any specific strategies or routines that have helped you maintain a work-life balance?',
                answer: '',
            },
            {
                question:
                    'How do you ensure quality time with your daughter while pursuing your educational and career goals?',
                answer: '',
            },
            {
                question:
                    'What support systems or resources do you rely on to help you juggle all these responsibilities?',
                answer: '',
            },
            {
                question:
                    'In what ways do you prioritize self-care and personal well-being amidst your busy schedule?',
                answer: '',
            },
            {
                question:
                    'What motivates you to stay focused on your health and education goals despite the challenges?',
                answer: '',
            },
            {
                question:
                    'How do you handle stress and maintain a positive mindset during demanding times?',
                answer: '',
            },
            {
                question:
                    'Have you considered seeking professional guidance or support to help you navigate these various responsibilities?',
                answer: '',
            },
            {
                question:
                    'What advice or tips would you give to other single parents facing similar challenges?',
                answer: '',
            },
        ],
    },
    {
        category: 'Social Relationships',
        questions: [
            {
                question:
                    'How do you involve your daughter in your hobbies like gardening and painting?',
                answer: '',
            },
            {
                question:
                    'What support do you have from family or friends in balancing your parenting responsibilities and work as a school counselor?',
                answer: '',
            },
            {
                question:
                    'Have you considered joining any parent support groups or community programs to connect with other single parents?',
                answer: '',
            },
            {
                question:
                    'How do you maintain communication with your friends while juggling your various responsibilities?',
                answer: '',
            },
            {
                question:
                    'In what ways do you prioritize self-care and social connections to stay motivated in achieving your health and educational goals?',
                answer: '',
            },
        ],
    },
    {
        category: 'Goals and Aspirations',
        questions: [
            {
                question:
                    'What are your short-term goals in terms of improving your diet and incorporating regular exercise?',
                answer: '',
            },
            {
                question:
                    'How do you envision balancing parenting, your job as a school counselor, hobbies, health goals, and educational aspirations?',
                answer: '',
            },
            {
                question:
                    "What motivates you to pursue a master's degree in educational psychology?",
                answer: '',
            },
            {
                question:
                    'In what ways do you see your interests in gardening and painting aligning with your long-term goals?',
                answer: '',
            },
            {
                question:
                    'What specific challenges do you face in maintaining work-life balance as a single parent?',
                answer: '',
            },
            {
                question:
                    'How do you plan to stay motivated in achieving your personal health and education goals?',
                answer: '',
            },
            {
                question:
                    'What advice or strategies would you find most helpful in effective parenting as a single parent?',
                answer: '',
            },
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
        category.questions.forEach((questionAnswerPair) => {
            const questionNode = {
                name: questionAnswerPair.question,
                answer: questionAnswerPair.answer,
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
    activeNode,
}) => {
    const isExpanded = expandedNodes.includes(node);
    const [answer, setAnswer] = useState('');
    const { updateAnswers } = useContext(ProfileContext);

    console.log(node);
    const handleClick = () => {
        if (isExpanded) {
            setExpandedNodes(expandedNodes.filter((n) => n !== node));
        } else {
            setExpandedNodes([...expandedNodes, node]);
        }
        onClick(node);
    };

    const handleAnswerChange = (e, node) => {
        
        node.answer = e.target.value;
        updateAnswers(node);
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
            id="node-container"
            sx={{
                position: 'absolute',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
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
                            activeNode={activeNode}
                        />
                    ))}
                    {isQuestion && node === activeNode && (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <Typography variant="body2">
                                {node.answer}
                            </Typography>
                            <CustomTextField
                                multiline
                                rows={4}
                                fullWidth
                                autoFocus
                                variant="standard"
                                value={node.answer}
                                onChange={(e) => setAnswer(e.target.value)}
                            />
                        </Box>
                    )}
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
                    activeNode={activeNode}
                />
            </Box>
        </Box>
    );
};

export default GraphComponent;
