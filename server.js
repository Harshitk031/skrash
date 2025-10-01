const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const connectDB = require('./config/db');
const Game = require('./models/Game');

require('dotenv').config();

var chooseWordTime = 20; // in seconds
var drawTime = 80; // in seconds

// Per-room state to avoid cross-room interference
const roomState = new Map();
function getRoomState(roomCode) {
    if (!roomState.has(roomCode)) {
        roomState.set(roomCode, {
            cancelChooseWordTimer: null,
            chooseTimerID: null,
            cancelDrawTimer: null,
            drawTimerID: null,
            wordOptions: []
        });
    }
    return roomState.get(roomCode);
}

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client', 'build')));


function random_word_gen() {
    wordlist = ['Pac-Man', 'bow', 'Apple', 'chest', 'six pack', 'nail', 'tornado', 'Mickey Mouse', 'Youtube', 'lightning', 'traffic light', 'waterfall', 'McDonalds', 'Donald Trump', 'Patrick', 'stop sign', 'Superman', 'tooth', 'sunflower', 'keyboard', 'island', 'Pikachu', 'Harry Potter', 'Nintendo Switch', 'Facebook', 'eyebrow', 'Peppa Pig', 'SpongeBob', 'Creeper', 'octopus', 'church', 'Eiffel tower', 'tongue', 'snowflake', 'fish', 'Twitter', 'pan', 'Jesus Christ', 'butt cheeks', 'jail', 'Pepsi', 'hospital', 'pregnant', 'thunderstorm', 'smile', 'skull', 'flower', 'palm tree', 'Angry Birds', 'America', 'lips', 'cloud', 'compass', 'mustache', 'Captain America', 'pimple', 'Easter Bunny', 'chicken', 'Elmo', 'watch', 'prison', 'skeleton', 'arrow', 'volcano', 'Minion', 'school', 'tie', 'lighthouse', 'fountain', 'Cookie Monster', 'Iron Man', 'Santa', 'blood', 'river', 'bar', 'Mount Everest', 'chest hair', 'Gumball', 'north', 'water', 'cactus', 'treehouse', 'bridge', 'short', 'thumb', 'beach', 'mountain', 'Nike', 'flag', 'Paris', 'eyelash', 'Shrek', 'brain', 'iceberg', 'fingernail', 'playground', 'ice cream', 'Google', 'dead', 'knife', 'spoon', 'unibrow', 'Spiderman', 'black', 'graveyard', 'elbow', 'golden egg', 'yellow', 'Germany', 'Adidas', 'nose hair', 'Deadpool', 'Homer Simpson', 'Bart Simpson', 'rainbow', 'ruler', 'building', 'raindrop', 'storm', 'coffee shop', 'windmill', 'fidget spinner', 'yo-yo', 'ice', 'legs', 'tent', 'mouth', 'ocean', 'Fanta', 'homeless', 'tablet', 'muscle', 'Pinocchio', 'tear', 'nose', 'snow', 'nostrils', 'Olaf', 'belly button', 'Lion King', 'car wash', 'Egypt', 'Statue of Liberty', 'Hello Kitty', 'pinky', 'Winnie the Pooh', 'guitar', 'Hulk', 'Grinch', 'Nutella', 'cold', 'flagpole', 'Canada', 'rainforest', 'blue', 'rose', 'tree', 'hot', 'mailbox', 'Nemo', 'crab', 'knee', 'doghouse', 'Chrome', 'cotton candy', 'Barack Obama', 'hot chocolate', 'Michael Jackson', 'map', 'Samsung', 'shoulder', 'Microsoft', 'parking', 'forest', 'full moon', 'cherry blossom', 'apple seed', 'Donald Duck', 'leaf', 'bat', 'earwax', 'Italy', 'finger', 'seed', 'lilypad', 'brush', 'record', 'wrist', 'thunder', 'gummy', 'Kirby', 'fire hydrant', 'overweight', 'hot dog', 'house', 'fork', 'pink', 'Sonic', 'street', 'Nasa', 'arm', 'fast', 'tunnel', 'full', 'library', 'pet shop', 'Yoshi', 'Russia', 'drum kit', 'Android', 'Finn and Jake', 'price tag', 'Tooth Fairy', 'bus stop', 'rain', 'heart', 'face', 'tower', 'bank', 'cheeks', 'Batman', 'speaker', 'Thor', 'skinny', 'electric guitar', 'belly', 'cute', 'ice cream truck', 'bubble gum', 'top hat', 'Pink Panther', 'hand', 'bald', 'freckles', 'clover', 'armpit', 'Japan', 'thin', 'traffic', 'spaghetti', 'Phineas and Ferb', 'broken heart', 'fingertip', 'funny', 'poisonous', 'Wonder Woman', 'Squidward', 'Mark Zuckerberg', 'twig', 'red', 'China', 'dream', 'Dora', 'daisy', 'France', 'Discord', 'toenail', 'positive', 'forehead', 'earthquake', 'iron', 'Zeus', 'Mercedes', 'Big Ben', 'supermarket', 'Bugs Bunny', 'Yin and Yang', 'drink', 'rock', 'drum', 'piano', 'white', 'bench', 'fall', 'royal', 'seashell', 'Audi', 'stomach', 'aquarium', 'Bitcoin', 'volleyball', 'marshmallow', 'Cat Woman', 'underground', 'Green Lantern', 'bottle flip', 'toothbrush', 'globe', 'sand', 'zoo', 'west', 'puddle', 'lobster', 'North Korea', 'Luigi', 'bamboo', 'Great Wall', 'Kim Jong-un', 'bad', 'credit card', 'swimming pool', 'Wolverine', 'head', 'hair', 'Yoda', 'Elsa', 'turkey', 'heel', 'maracas', 'clean', 'droplet', 'cinema', 'poor', 'stamp', 'Africa', 'whistle', 'Teletubby', 'wind', 'Aladdin', 'tissue box', 'fire truck', 'Usain Bolt', 'water gun', 'farm', 'iPad', 'well', 'warm', 'booger', 'WhatsApp', 'Skype', 'landscape', 'pine cone', 'Mexico', 'slow', 'organ', 'fish bowl', 'teddy bear', 'John Cena', 'Frankenstein', 'tennis racket', 'gummy bear', 'Mount Rushmore', 'swing', 'Mario', 'lake', 'point', 'vein', 'cave', 'smell', 'chin', 'desert', 'scary', 'Dracula', 'airport', 'kiwi', 'seaweed', 'incognito', 'Pluto', 'statue', 'hairy', 'strawberry', 'low', 'invisible', 'blindfold', 'tuna', 'controller', 'Paypal', 'King Kong', 'neck', 'lung', 'weather', 'Xbox', 'tiny', 'icicle', 'flashlight', 'scissors', 'emoji', 'strong', 'saliva', 'firefighter', 'salmon', 'basketball', 'spring', 'Tarzan', 'red carpet', 'drain', 'coral reef', 'nose ring', 'caterpillar', 'Wall-e', 'seat belt', 'polar bear', 'Scooby Doo', 'wave', 'sea', 'grass', 'pancake', 'park', 'lipstick', 'pickaxe', 'east', 'grenade', 'village', 'Flash', 'throat', 'dizzy', 'Asia', 'petal', 'Gru', 'country', 'spaceship', 'restaurant', 'copy', 'skin', 'glue stick', 'Garfield', 'equator', 'blizzard', 'golden apple', 'Robin Hood', 'fast food', 'barbed wire', 'Bill Gates', 'Tower of Pisa', 'neighborhood', 'lightsaber', 'video game', 'high heels', 'dirty', 'flamethrower', 'pencil sharpener', 'hill', 'old', 'flute', 'cheek', 'violin', 'fireball', 'spine', 'bathtub', 'cell phone', 'breath', 'open', 'Australia', 'toothpaste', 'Tails', 'skyscraper', 'cowbell', 'rib', 'ceiling fan', 'Eminem', 'Jimmy Neutron', 'photo frame', 'barn', 'sandstorm', 'Jackie Chan', 'Abraham Lincoln', 'T-rex', 'pot of gold', 'KFC', 'shell', 'poison', 'acne', 'avocado', 'study', 'bandana', 'England', 'Medusa', 'scar', 'Skittles', 'Pokemon', 'branch', 'Dumbo', 'factory', 'Hollywood', 'deep', 'knuckle', 'popular', 'piggy bank', 'Las Vegas', 'microphone', 'Tower Bridge', 'butterfly', 'slide', 'hut', 'shovel', 'hamburger', 'shop', 'fort', 'Ikea', 'planet', 'border', 'panda', 'highway', 'swamp', 'tropical', 'lightbulb', 'Kermit', 'headphones', 'jungle', 'Reddit', 'young', 'trumpet', 'cheeseburger', 'gas mask', 'apartment', 'manhole', 'nutcracker', 'Antarctica', 'mansion', 'bunk bed', 'sunglasses', 'spray paint', 'Jack-o-lantern', 'saltwater', 'tank', 'cliff', 'campfire', 'palm', 'pumpkin', 'elephant', 'banjo', 'nature', 'alley', 'fireproof', 'earbuds', 'crossbow', 'Elon Musk', 'quicksand', 'Playstation', 'Hawaii', 'good', 'corn dog', 'Gandalf', 'dock', 'magic wand', 'field', 'Solar System', 'photograph', 'ukulele', 'James Bond', 'The Beatles', 'Katy Perry', 'pirate ship', 'Poseidon', 'Netherlands', 'photographer', 'Lego', 'hourglass', 'glass', 'path', 'hotel', 'ramp', 'dandelion', 'Brazil', 'coral', 'cigarette', 'messy', 'Dexter', 'valley', 'parachute', 'wine glass', 'matchbox', 'Morgan Freeman', 'black hole', 'midnight', 'astronaut', 'paper bag', 'sand castle', 'forest fire', 'hot sauce', 'social media', 'William Shakespeare', 'trash can', 'fire alarm', 'lawn mower', 'nail polish', 'Band-Aid', 'Star Wars', 'clothes hanger', 'toe', 'mud', 'coconut', 'jaw', 'bomb', 'south', 'firework', 'sailboat', 'loading', 'iPhone', 'toothpick', 'BMW', 'ketchup', 'fossil', 'explosion', 'Finn', 'Einstein', 'infinite', 'dictionary', 'Photoshop', 'trombone', 'clarinet', 'rubber', 'saxophone', 'helicopter', 'temperature', 'bus driver', 'cello', 'London', 'newspaper', 'blackberry', 'shopping cart', 'Florida', 'Daffy Duck', 'mayonnaise', 'gummy worm', 'flying pig', 'underweight', 'Crash Bandicoot', 'bungee jumping', 'kindergarten', 'umbrella', 'hammer', 'night', 'laser', 'glove', 'square', 'Morty', 'firehouse', 'dynamite', 'chainsaw', 'melon', 'waist', 'Chewbacca', 'kidney', 'stoned', 'Rick', 'ticket', 'skateboard', 'microwave', 'television', 'soil', 'exam', 'cocktail', 'India', 'Colosseum', 'missile', 'hilarious', 'Popeye', 'nuke', 'silo', 'chemical', 'museum', 'Vault boy', 'adorable', 'fast forward', 'firecracker', 'grandmother', 'Porky Pig', 'roadblock', 'continent', 'wrinkle', 'shaving cream', 'Northern Lights', 'tug', 'London Eye', 'Israel', 'shipwreck', 'xylophone', 'motorcycle', 'diamond', 'root', 'coffee', 'princess', 'Oreo', 'goldfish', 'wizard', 'chocolate', 'garbage', 'ladybug', 'shotgun', 'kazoo', 'Minecraft', 'video', 'message', 'lily', 'fisherman', 'cucumber', 'password', 'western', 'ambulance', 'doorknob', 'glowstick', 'makeup', 'barbecue', 'jazz', 'hedgehog', 'bark', 'tombstone', 'coast', 'pitchfork', 'Christmas', 'opera', 'office', 'insect', 'hunger', 'download', 'hairbrush', 'blueberry', 'cookie jar', 'canyon', 'Happy Meal', 'high five', 'fern', 'quarter', 'peninsula', 'imagination', 'microscope', 'table tennis', 'whisper', 'fly swatter', 'pencil case', 'harmonica', 'Family Guy', 'New Zealand', 'apple pie', 'warehouse', 'cookie', 'USB', 'jellyfish', 'bubble', 'battery', 'fireman', 'pizza', 'angry', 'taco', 'harp', 'alcohol', 'pound', 'bedtime', 'megaphone', 'husband', 'oval', 'rail', 'stab', 'dwarf', 'milkshake', 'witch', 'bakery', 'president', 'weak', 'second', 'sushi', 'mall', 'complete', 'hip hop', 'slippery', 'horizon', 'prawn', 'plumber', 'blowfish', 'Madagascar', 'Europe', 'bazooka', 'pogo stick', 'Terminator', 'Hercules', 'notification', 'snowball fight', 'high score', 'Kung Fu', 'Lady Gaga', 'geography', 'sledgehammer', 'bear trap', 'sky', 'cheese', 'vine', 'clown', 'catfish', 'snowman', 'bowl', 'waffle', 'vegetable', 'hook', 'shadow', 'dinosaur', 'lane', 'dance', 'scarf', 'cabin', 'Tweety', 'bookshelf', 'swordfish', 'skyline', 'base', 'straw', 'biscuit', 'Greece', 'bleach', 'pepper', 'reflection', 'universe', 'skateboarder', 'triplets', 'gold chain', 'electric car', 'policeman', 'electricity', 'mother', 'Bambi', 'croissant', 'Ireland', 'sandbox', 'stadium', 'depressed', 'Johnny Bravo', 'silverware', 'raspberry', 'dandruff', 'Scotland', 'comic book', 'cylinder', 'Milky Way', 'taxi driver', 'magic trick', 'sunrise', 'popcorn', 'eat', 'cola', 'cake', 'pond', 'mushroom', 'rocket', 'surfboard', 'baby', 'cape', 'glasses', 'sunburn', 'chef', 'gate', 'charger', 'crack', 'mohawk', 'triangle', 'carpet', 'dessert', 'taser', 'afro', 'cobra', 'ringtone', 'cockroach', 'levitate', 'mailman', 'rockstar', 'lyrics', 'grumpy', 'stand', 'Norway', 'binoculars', 'nightclub', 'puppet', 'novel', 'injection', 'thief', 'pray', 'chandelier', 'exercise', 'lava lamp', 'lap', 'massage', 'thermometer', 'golf cart', 'postcard', 'bell pepper', 'bed bug', 'paintball', 'Notch', 'yogurt', 'graffiti', 'burglar', 'butler', 'seafood', 'Sydney Opera House', 'Susan Wojcicki', 'parents', 'bed sheet', 'Leonardo da Vinci', 'intersection', 'palace', 'shrub', 'lumberjack', 'relationship', 'observatory', 'junk food', 'eye', 'log', 'dice', 'bicycle', 'pineapple', 'camera', 'circle', 'lemonade', 'soda', 'comb', 'cube', 'Doritos', 'love', 'table', 'honey', 'lighter', 'broccoli', 'fireplace', 'drive', 'Titanic', 'backpack', 'emerald', 'giraffe', 'world', 'internet', 'kitten', 'volume', 'Spain', 'daughter', 'armor', 'noob', 'rectangle', 'driver', 'raccoon', 'bacon', 'lady', 'bull', 'camping', 'poppy', 'snowball', 'farmer', 'lasso', 'breakfast', 'oxygen', 'milkman', 'caveman', 'laboratory', 'bandage', 'neighbor', 'Cupid', 'Sudoku', 'wedding', 'seagull', 'spatula', 'atom', 'dew', 'fortress', 'vegetarian', 'ivy', 'snowboard', 'conversation', 'treasure', 'chopsticks', 'garlic', 'vacuum', 'swimsuit', 'divorce', 'advertisement', 'vuvuzela', 'Mr Bean', 'Fred Flintstone', 'pet food', 'upgrade', 'voodoo', 'punishment', 'Charlie Chaplin', 'Rome', 'graduation', 'beatbox', 'communism', 'yeti', 'ear', 'dots', 'octagon', 'kite', 'lion', 'winner', 'muffin', 'cupcake', 'unicorn', 'smoke', 'lime', 'monster', 'Mars', 'moss', 'summer', 'lollipop', 'coffin', 'paint', 'lottery', 'wife', 'pirate', 'sandwich', 'lantern', 'seahorse', 'Cuba', 'archer', 'sweat', 'deodorant', 'plank', 'Steam', 'birthday', 'submarine', 'zombie', 'casino', 'gas', 'stove', 'helmet', 'mosquito', 'ponytail', 'corpse', 'subway', 'spy', 'jump rope', 'baguette', 'grin', 'centipede', 'gorilla', 'website', 'text', 'workplace', 'bookmark', 'anglerfish', 'wireless', 'Zorro', 'sports', 'abstract', 'detective', 'Amsterdam', 'elevator', 'chimney', 'reindeer', 'Singapore', 'perfume', 'soldier', 'bodyguard', 'magnifier', 'freezer', 'radiation', 'assassin', 'yawn', 'backbone', 'disaster', 'giant', 'pillow fight', 'grasshopper', 'Vin Diesel', 'geyser', 'burrito', 'celebrity', 'Lasagna', 'Pumba', 'karaoke', 'hypnotize', 'platypus', 'Leonardo DiCaprio', 'bird bath', 'battleship', 'back pain', 'rapper', 'werewolf', 'Black Friday', 'cathedral', 'Sherlock Holmes', 'ABBA', 'hard hat', 'sword', 'mirror', 'toilet', 'eggplant', 'jelly', 'hero', 'starfish', 'bread', 'snail', 'person', 'plunger', 'computer', 'nosebleed', 'goat', 'joker', 'sponge', 'mop', 'owl', 'beef', 'portal', 'genie', 'crocodile', 'murderer', 'magic', 'pine', 'winter', 'robber', 'pepperoni', 'shoebox', 'fog', 'screen', 'son', 'folder', 'mask', 'Goofy', 'Mercury', 'zipline', 'wall', 'dragonfly', 'zipper', 'meatball', 'slingshot', 'Pringles', 'circus', 'mammoth', 'nugget', 'mousetrap', 'recycling', 'revolver', 'champion', 'zigzag', 'meat', 'drought', 'vodka', 'notepad', 'porcupine', 'tuba', 'hacker', 'broomstick', 'kitchen', 'cheesecake', 'satellite', 'JayZ', 'squirrel', 'leprechaun', 'jello', 'gangster', 'raincoat', 'eyeshadow', 'shopping', 'gardener', 'scythe', 'portrait', 'jackhammer', 'allergy', 'honeycomb', 'headache', 'Miniclip', 'Mona Lisa', 'cheetah', 'virtual reality', 'virus', 'Argentina', 'blanket', 'military', 'headband', 'superpower', 'language', 'handshake', 'reptile', 'thirst', 'fake teeth', 'duct tape', 'macaroni', 'color-blind', 'comfortable', 'Robbie Rotten', 'coast guard', 'cab driver', 'pistachio', 'Angelina Jolie', 'autograph', 'sea lion', 'Morse code', 'clickbait', 'star', 'girl', 'lemon', 'alarm', 'shoe', 'soap', 'button', 'kiss', 'grave', 'telephone', 'fridge', 'katana', 'switch', 'eraser', 'signature', 'pasta', 'flamingo', 'crayon', 'puzzle', 'hard', 'juice', 'socks', 'crystal', 'telescope', 'galaxy', 'squid', 'tattoo', 'bowling', 'lamb', 'silver', 'lid', 'taxi', 'basket', 'step', 'stapler', 'pigeon', 'zoom', 'teacher', 'holiday', 'score', 'Tetris', 'frame', 'garden', 'stage', 'unicycle', 'cream', 'sombrero', 'error', 'battle', 'starfruit', 'hamster', 'chalk', 'spiral', 'bounce', 'hairspray', 'lizard', 'victory', 'balance', 'hexagon', 'Ferrari', 'MTV', 'network', 'weapon', 'fist fight', 'vault', 'mattress', 'viola', 'birch', 'stereo', 'Jenga', 'plug', 'chihuahua', 'plow', 'pavement', 'wart', 'ribbon', 'otter', 'magazine', 'Bomberman', 'vaccine', 'elder', 'Romania', 'champagne', 'semicircle', 'Suez Canal', 'Mr Meeseeks', 'villain', 'inside', 'spade', 'gravedigger', 'Bruce Lee', 'gentle', 'stingray', 'can opener', 'funeral', 'jet ski', 'wheelbarrow', 'thug', 'undo', 'fabulous', 'space suit', 'cappuccino', 'Minotaur', 'skydiving', 'cheerleader', 'Stone Age', 'Chinatown', 'razorblade', 'crawl space', 'cauldron', 'trick shot', 'Steve Jobs', 'audience', 'time machine', 'sewing machine', 'face paint', 'truck driver', 'x-ray', 'fly', 'salt', 'spider', 'boy', 'dollar', 'turtle', 'book', 'chain', 'dolphin', 'sing', 'milk', 'wing', 'pencil', 'snake', 'scream', 'toast', 'vomit', 'salad', 'radio', 'potion', 'dominoes', 'balloon', 'monkey', 'trophy', 'feather', 'leash', 'loser', 'bite', 'notebook', 'happy', 'Mummy', 'sneeze', 'koala', 'tired', 'sick', 'pipe', 'jalapeno', 'diaper', 'deer', 'priest', 'youtuber', 'boomerang', 'pro', 'ruby', 'hop', 'hopscotch', 'barcode', 'vote', 'wrench', 'tissue', 'doll', 'clownfish', 'halo', 'Monday', 'tentacle', 'grid', 'Uranus', 'oil', 'scarecrow', 'tarantula', 'germ', 'glow', 'haircut', 'Vatican', 'tape', 'judge', 'cell', 'diagonal', 'science', 'mustard', 'fur', 'janitor', 'ballerina', 'pike', 'nun', 'chime', 'tuxedo', 'Cerberus', 'panpipes', 'surface', 'coal', 'knot', 'willow', 'pajamas', 'fizz', 'student', 'eclipse', 'asteroid', 'Portugal', 'pigsty', 'brand', 'crowbar', 'chimpanzee', 'Chuck Norris', 'raft', 'carnival', 'treadmill', 'professor', 'tricycle', 'apocalypse', 'vitamin', 'orchestra', 'groom', 'cringe', 'knight', 'litter box', 'macho', 'brownie', 'hummingbird', 'Hula Hoop', 'motorbike', 'type', 'catapult', 'take off', 'wake up', 'concert', 'floppy disk', 'BMX', 'bulldozer', 'manicure', 'brainwash', 'William Wallace', 'guinea pig', 'motherboard', 'wheel', 'brick', 'egg', 'lava', 'queen', 'gold', 'God', 'ladder', 'coin', 'laptop', 'toaster', 'butter', 'bag', 'doctor', 'sit', 'tennis', 'half', 'Bible', 'noodle', 'golf', 'eagle', 'cash', 'vampire', 'sweater', 'father', 'remote', 'safe', 'jeans', 'darts', 'graph', 'nothing', 'dagger', 'stone', 'wig', 'cupboard', 'minute', 'match', 'slime', 'garage', 'tomb', 'soup', 'bathroom', 'llama', 'shampoo', 'swan', 'frown', 'toolbox', 'jacket', 'adult', 'crate', 'quill', 'spin', 'waiter', 'mint', 'kangaroo', 'captain', 'loot', 'maid', 'shoelace', 'luggage', 'cage', 'bagpipes', 'loaf', 'aircraft', 'shelf', 'safari', 'afterlife', 'napkin', 'steam', 'coach', 'slope', 'marigold', 'Mozart', 'bumper', 'Asterix', 'vanilla', 'papaya', 'ostrich', 'failure', 'scoop', 'tangerine', 'firefly', 'centaur', 'harbor', 'uniform', 'Beethoven', 'Intel', 'moth', 'Spartacus', 'fluid', 'acid', 'sparkles', 'talent show', 'ski jump', 'polo', 'ravioli', 'delivery', 'woodpecker', 'logo', 'Stegosaurus', 'diss track', 'Darwin Watterson', 'filmmaker', 'silence', 'dashboard', 'echo', 'windshield', 'Home Alone', 'tablecloth', 'backflip', 'headboard', 'licorice', 'sunshade', 'Picasso', 'airbag', 'water cycle', 'meatloaf', 'insomnia', 'broom', 'whale', 'pie', 'demon', 'bed', 'braces', 'fence', 'orange', 'sleep', 'gift', 'Popsicle', 'spear', 'zebra', 'Saturn', 'maze', 'chess', 'wire', 'angel', 'skates', 'pyramid', 'shower', 'claw', 'hell', 'goal', 'bottle', 'dress', 'walk', 'AC/DC', 'tampon', 'goatee', 'prince', 'flask', 'cut', 'cord', 'roof', 'movie', 'ash', 'tiger', 'player', 'magician', 'wool', 'saddle', 'cowboy', 'derp', 'suitcase', 'sugar', 'nest', 'anchor', 'onion', 'magma', 'limbo', 'collar', 'mole', 'bingo', 'walnut', 'wealth', 'security', 'leader', 'melt', 'Gandhi', 'arch', 'toy', 'turd', 'scientist', 'hippo', 'glue', 'kneel', 'orbit', 'below', 'totem', 'health', 'towel', 'diet', 'crow', 'addiction', 'minigolf', 'clay', 'boar', 'navy', 'butcher', 'trigger', 'referee', 'bruise', 'translate', 'yearbook', 'confused', 'engine', 'poke', 'wreath', 'omelet', 'gravity', 'bride', 'godfather', 'flu', 'accordion', 'engineer', 'cocoon', 'minivan', 'bean bag', 'antivirus', 'billiards', 'rake', 'cement', 'cauliflower', 'espresso', 'violence', 'blender', 'chew', 'bartender', 'witness', 'hobbit', 'corkscrew', 'chameleon', 'cymbal', 'Excalibur', 'grapefruit', 'action', 'outside', 'guillotine', 'timpani', 'frostbite', 'leave', 'Mont Blanc', 'palette', 'electrician', 'fitness trainer', 'journalist', 'fashion designer', 'bucket', 'penguin', 'sheep', 'torch', 'robot', 'peanut', 'UFO', 'belt', 'Earth', 'magnet', 'dragon', 'soccer', 'desk', 'search', 'seal', 'scribble', 'gender', 'food', 'anvil', 'crust', 'bean', 'hockey', 'pot', 'pretzel', 'needle', 'blimp', 'plate', 'drool', 'frog', 'basement', 'idea', 'bracelet', 'cork', 'sauce', 'gang', 'sprinkler', 'shout', 'morning', 'poodle', 'karate', 'bagel', 'wolf', 'sausage', 'heat', 'wasp', 'calendar', 'tadpole', 'religion', 'hose', 'sleeve', 'acorn', 'sting', 'market', 'marble', 'comet', 'pain', 'cloth', 'drawer', 'orca', 'hurdle', 'pinball', 'narwhal', 'pollution', 'metal', 'race', 'end', 'razor', 'dollhouse', 'distance', 'prism', 'pub', 'lotion', 'vanish', 'vulture', 'beanie', 'burp', 'periscope', 'cousin', 'customer', 'label', 'mold', 'kebab', 'beaver', 'spark', 'meme', 'pudding', 'almond', 'mafia', 'gasp', 'nightmare', 'mermaid', 'season', 'gasoline', 'evening', 'eel', 'cast', 'hive', 'beetle', 'diploma', 'jeep', 'bulge', 'wrestler', 'Anubis', 'mascot', 'spinach', 'hieroglyph', 'anaconda', 'handicap', 'walrus', 'blacksmith', 'robin', 'reception', 'invasion', 'fencing', 'sphinx', 'evolution', 'brunette', 'traveler', 'jaguar', 'diagram', 'hovercraft', 'parade', 'dome', 'credit', 'tow truck', 'shallow', 'vlogger', 'veterinarian', 'furniture', 'commercial', 'cyborg', 'scent', 'defense', 'accident', 'marathon', 'demonstration', 'NASCAR', 'Velociraptor', 'pharmacist', 'Xerox', 'gentleman', 'dough', 'rhinoceros', 'air conditioner', 'poop', 'clock', 'carrot', 'cherry', 'candle', 'boots', 'target', 'wine', 'die', 'moon', 'airplane', 'think', 'pause', 'pill', 'pocket', 'Easter', 'horse', 'child', 'lamp', 'pillow', 'yolk', 'potato', 'pickle', 'nurse', 'ham', 'ninja', 'screw', 'board', 'pin', 'lettuce', 'console', 'climb', 'goose', 'bill', 'tortoise', 'sink', 'ski', 'glitter', 'miner', 'parrot', 'clap', 'spit', 'wiggle', 'peacock', 'roll', 'ballet', 'ceiling', 'celebrate', 'blind', 'yacht', 'addition', 'flock', 'powder', 'paddle', 'harpoon', 'kraken', 'baboon', 'antenna', 'classroom', 'bronze', 'writer', 'Obelix', 'touch', 'sensei', 'rest', 'puma', 'dent', 'shake', 'goblin', 'laundry', 'cloak', 'detonate', 'Neptune', 'cotton', 'generator', 'canary', 'horsewhip', 'racecar', 'Croatia', 'tip', 'cardboard', 'commander', 'seasick', 'anthill', 'vinegar', 'hippie', 'dentist', 'animation', 'Slinky', 'wallpaper', 'pendulum', 'vertical', 'chestplate', 'anime', 'beanstalk', 'survivor', 'florist', 'faucet', 'spore', 'risk', 'wonderland', 'wrestling', 'hazelnut', 'cushion', 'W-LAN', 'mayor', 'community', 'raisin', 'udder', 'oyster', 'sew', 'hazard', 'curry', 'pastry', 'mime', 'victim', 'mechanic', 'hibernate', 'bouncer', 'Iron Giant', 'floodlight', 'pear', 'sad', 'paw', 'space', 'bullet', 'skribbl.io', 'shirt', 'cow', 'worm', 'king', 'tea', 'truck', 'pants', 'hashtag', 'DNA', 'bird', 'Monster', 'beer', 'curtain', 'tire', 'nachos', 'bear', 'cricket', 'teapot', 'nerd', 'deaf', 'fruit', 'meteorite', 'rice', 'sniper', 'sale', 'gnome', 'shock', 'shape', 'alligator', 'meal', 'nickel', 'party', 'hurt', 'Segway', 'Mr. Bean', 'banker', 'cartoon', 'double', 'hammock', 'juggle', 'pope', 'leak', 'room', 'throne', 'hoof', 'radar', 'wound', 'luck', 'swag', 'panther', 'flush', 'Venus', 'disease', 'fortune', 'porch', 'machine', 'pilot', 'copper', 'mantis', 'keg', 'biology', 'wax', 'gloss', 'leech', 'sculpture', 'pelican', 'trapdoor', 'plague', 'quilt', 'yardstick', 'lounge', 'teaspoon', 'broadcast', 'uncle', 'comedian', 'mannequin', 'peasant', 'streamer', 'oar', 'drama', 'cornfield', 'carnivore', 'wingnut', 'vent', 'cabinet', 'vacation', 'applause', 'vision', 'radish', 'picnic', 'Skrillex', 'jester', 'preach', 'armadillo', 'hyena', 'librarian', 'interview', 'sauna', 'surgeon', 'dishrag', 'manatee', 'symphony', 'queue', 'industry', 'Atlantis', 'excavator', 'canister', 'model', 'flight attendant', 'ghost', 'pig', 'key', 'banana', 'tomato', 'axe', 'line', 'present', 'duck', 'alien', 'peas', 'gem', 'web', 'grapes', 'corn', 'can', 'fairy', 'camel', 'paper', 'beak', 'corner', 'penny', 'dig', 'link', 'donkey', 'fox', 'rug', 'drip', 'hunter', 'horn', 'purse', 'gumball', 'pony', 'musket', 'flea', 'kettle', 'rooster', 'balcony', 'seesaw', 'stork', 'dinner', 'greed', 'bait', 'duel', 'trap', 'heist', 'origami', 'skunk', 'coaster', 'leather', 'socket', 'fireside', 'cannon', 'ram', 'filter', 'alpaca', 'Zelda', 'condiment', 'server', 'antelope', 'emu', 'chestnut', 'dalmatian', 'swarm', 'sloth', 'reality', 'Darwin', 'torpedo', 'toucan', 'pedal', 'tabletop', 'frosting', 'bellow', 'vortex', 'bayonet', 'margarine', 'orchid', 'beet', 'journey', 'slam', 'marmalade', 'employer', 'stylus', 'spoiler', 'repeat', 'tiramisu', 'cuckoo', 'collapse', 'eskimo', 'assault', 'orangutan', 'wrapping', 'albatross', 'mothball', 'evaporate', 'turnip', 'puffin', 'reeds', 'receptionist', 'impact', 'dispenser', 'nutshell', 'procrastination', 'architect', 'programmer', 'bricklayer', 'boat', 'bell', 'ring', 'fries', 'money', 'chair', 'door', 'bee', 'tail', 'ball', 'mouse', 'rat', 'window', 'peace', 'nut', 'blush', 'page', 'toad', 'hug', 'ace', 'tractor', 'peach', 'whisk', 'hen', 'day', 'shy', 'lawyer', 'rewind', 'tripod', 'trailer', 'hermit', 'welder', 'festival', 'punk', 'handle', 'protest', 'lens', 'attic', 'foil', 'promotion', 'work', 'limousine', 'patriot', 'badger', 'studio', 'athlete', 'quokka', 'trend', 'pinwheel', 'gravel', 'fabric', 'lemur', 'provoke', 'rune', 'display', 'nail file', 'embers', 'asymmetry', 'actor', 'carpenter', 'aristocrat', 'Zuma', 'chinchilla', 'archaeologist', 'apple', 'hat', 'sun', 'box', 'cat', 'cup', 'train', 'bunny', 'sound', 'run', 'barrel', 'barber', 'grill', 'read', 'family', 'moose', 'boil', 'printer', 'poster', 'sledge', 'nutmeg', 'heading', 'cruise', 'pillar', 'retail', 'monk', 'spool', 'catalog', 'scuba', 'anteater', 'pensioner', 'coyote', 'vise', 'bobsled', 'purity', 'tailor', 'meerkat', 'weasel', 'invention', 'lynx', 'kendama', 'zeppelin', 'patient', 'gladiator', 'slump', 'Capricorn', 'baklava', 'prune', 'stress', 'crucible', 'hitchhiker', 'election', 'caviar', 'marmot', 'hair roller', 'pistol', 'cone', 'ant', 'lock', 'hanger', 'cap', 'Mr. Meeseeks', 'comedy', 'coat', 'tourist', 'tickle', 'facade', 'shrew', 'diva', 'patio', 'apricot', 'spelunker', 'parakeet', 'barbarian', 'tumor', 'figurine', 'desperate', 'landlord', 'bus', 'mug', 'dog', 'shark'];

    return wordlist[Math.floor(Math.random() * wordlist.length)]
}

const socs = new Set();
playersList = {}
var soc;
var uniqueName = true;
// Track DB connection status
let isDbConnected = false;

// When a client connects to the server
io.on('connection', socket => {
    soc = socket;
    console.log('A user connected:', socket.id);
    socs.add(socket);

    // Handle room creation and joining
    socket.on('createRoom', async (data) => {
        const { playerName, roomCode } = data;
        try {
            if (!isDbConnected) {
                return socket.emit('serverError', 'Database not connected. Please try again in a moment.');
            }
            let game = await Game.findOne({ roomCode });
            if (game) {
                return socket.emit('serverError', 'Room already exists');
            }
            game = new Game({
                roomCode,
                players: [{
                    playerName,
                    socID: socket.id,
                    isRoomOwner: true,
                }],
            });
            await game.save();
            socket.join(roomCode);
            socket.emit('roomCreated', game);
        } catch (err) {
            console.error(err.message);
            socket.emit('serverError', 'Server error');
        }
    });

    socket.on('joinRoom', async (data) => {
        const { playerName, roomCode } = data;
        try {
            if (!isDbConnected) {
                return socket.emit('serverError', 'Database not connected. Please try again in a moment.');
            }
            const player = {
                playerName,
                socID: socket.id,
            };
            const game = await Game.findOneAndUpdate(
                { roomCode },
                { $push: { players: player } },
                { new: true }
            );

            if (!game) {
                return socket.emit('serverError', 'Room not found');
            }
            
            socket.join(roomCode);
            
            if (game.hasGameStarted) {
                const gameState = {
                    currentDrawer: game.chosenPlayer,
                    wordHint: game.wordToDraw ? game.wordToDraw.replace(/./g, '_ ') : '',
                    round: game.roundNumber,
                    players: game.players.map(p => ({ name: p.playerName, score: p.score })),
                };
                socket.emit('gameStateUpdate', gameState);
            }
            
            io.to(roomCode).emit('playerListUpdate', game.players);
        } catch (err) {
            console.error(err.message);
            socket.emit('serverError', 'Server error');
        }
    });


    socket.emit('welcome', "welcome to skribbl");

    socket.on('position', data => {
        socket.to(data.roomCode).emit('otherPOS', data);
    });

    // Removed unused startPaint event; drawing sync happens via 'position'



    socket.on('startGame', async (roomCode) => {
        try {
            let game = await Game.findOne({ roomCode });
            if (!game) {
                return socket.emit('serverError', 'Game not found');
            }

            // Enforce host-only start and minimum players
            const me = game.players.find(p => p.socID === socket.id);
            if (!me || !me.isRoomOwner) {
                return socket.emit('serverError', 'Only the host can start the game');
            }
            if (game.players.length < 2) {
                return socket.emit('serverError', 'At least 2 players are required to start');
            }

            const updatedGame = await Game.findOneAndUpdate(
                { roomCode },
                { $set: { hasGameStarted: true, playerIndex: 0, roundNumber: 0 } },
                { new: true }
            );

            io.to(roomCode).emit('gameStarted', updatedGame);
            gameStart(roomCode);
        } catch (err) {
            console.error(err.message);
            socket.emit('serverError', 'Server error');
        }
    });

    // Clear canvas for a room
    socket.on('clearCanvas', ({ roomCode }) => {
        if (!roomCode) return;
        io.to(roomCode).emit('clearCanvas');
    });

    // Handle votes (like/dislike drawing) scoped to room
    socket.on('vote', ({ roomCode, playerName, direction }) => {
        if (!roomCode || !playerName || !direction) return;
        io.to(roomCode).emit('vote', { playerName, direction });
    });


    socket.on('chosenWord', async ({ roomCode, word }) => {
        try {
            const game = await Game.findOneAndUpdate(
                { roomCode },
                { $set: { wordToDraw: word } },
                { new: true }
            );
            if (!game) return;

            io.to(roomCode).emit('wordCount', word.length);

            const state = getRoomState(roomCode);
            if (state.cancelChooseWordTimer) {
                state.cancelChooseWordTimer();
                state.cancelChooseWordTimer = null;
            }
        } catch (err) {
            console.error(err.message);
        }
    });

    socket.on('updateText', async ({ roomCode, playerName, message }) => {
        try {
            let game = await Game.findOne({ roomCode });
            if (!game || !game.wordToDraw) return;

            const formattedWord = message.toLowerCase().trim();
            const formattedGuessWord = game.wordToDraw.toLowerCase().trim();

            if (game.guessersList.includes(playerName)) {
                const chatMessage = {
                    id: Date.now(),
                    playerName,
                    content: message,
                    timestamp: new Date().toLocaleTimeString(),
                    color: 'gray'
                };
                return io.to(roomCode).emit('chatContent', chatMessage);
            }

            if (formattedGuessWord === formattedWord) {
                const updatedGame = await Game.findOneAndUpdate(
                    { roomCode },
                    { $push: { guessersList: playerName } },
                    { new: true }
                );
                if (!updatedGame) return;

                io.to(roomCode).emit('correctGuess', [playerName, updatedGame.wordToDraw]);

                if (updatedGame.guessersList.length === updatedGame.players.length - 1) {
                    io.to(roomCode).emit('allGuessed');
                    const state = getRoomState(roomCode);
                    if (state && state.cancelDrawTimer) {
                        if (state.drawTimerID) clearTimeout(state.drawTimerID);
                        state.cancelDrawTimer();
                        state.cancelDrawTimer = null;
                    }
                }
                return;
            }

            if (message.toLowerCase().includes(formattedGuessWord)) {
                const chatMessage = {
                    id: Date.now(),
                    playerName: "Server",
                    content: `${playerName}'s guess is close`,
                    timestamp: new Date().toLocaleTimeString(),
                    color: 'orange'
                };
                return io.to(roomCode).emit('chatContent', chatMessage);
            }

            const chatMessage = {
                id: Date.now(),
                playerName,
                content: message,
                timestamp: new Date().toLocaleTimeString(),
                color: 'black'
            };
            io.to(roomCode).emit('chatContent', chatMessage);

        } catch (err) {
            console.error(err.message);
        }
    });

    // Removed legacy admin controls and unused globals

    // When the client disconnects
    socket.on('disconnect', async () => {
        try {
            let game = await Game.findOne({ "players.socID": socket.id });
            if (!game) return;

            const player = game.players.find(p => p.socID === socket.id);
            if (!player) return;

            if (player.isRoomOwner) {
                await Game.deleteOne({ roomCode: game.roomCode });
                io.to(game.roomCode).emit('roomClosed');
            } else {
                const updatedGame = await Game.findOneAndUpdate(
                    { roomCode: game.roomCode },
                    { $pull: { players: { socID: socket.id } } },
                    { new: true }
                );
                io.to(game.roomCode).emit('playerLeft', updatedGame);
            }
        } catch (err) {
            console.error(err.message);
        }
    });




    async function Fun(roomCode) {
        try {
            await Game.updateOne({ roomCode }, { $set: { guessersList: [], scoreBoard: [], wordToDraw: null } });

            io.to(roomCode).emit('chooseStart', chooseWordTime);
            await chooseWordtimer(roomCode);
            io.to(roomCode).emit('chooseEnd');

            let game = await Game.findOne({ roomCode });
            const state = getRoomState(roomCode);
            if (game.wordToDraw == null) {
                game = await Game.findOneAndUpdate(
                    { roomCode },
                    { $set: { wordToDraw: state.wordOptions[0] } },
                    { new: true }
                );
                io.to(roomCode).emit('wordCount', game.wordToDraw.length);
                const chosenPlayerObjTmp = game.players.find(p => p.playerName === game.chosenPlayer);
                if (chosenPlayerObjTmp) {
                    io.to(chosenPlayerObjTmp.socID).emit('chosenWord', [game.wordToDraw, game.chosenPlayer]);
                }
            }

            io.to(roomCode).emit("clearCanvas");
            io.to(roomCode).emit("drawStart", drawTime);
            await Drawingtimer(roomCode);
            io.to(roomCode).emit('drawEnd');

            game = await Game.findOne({ roomCode });
            function calculateScore(playerIndex) {
                if (playerIndex === 0) return 300;
                const baseScore = 290;
                const scoreReduction = (playerIndex - 1) * 10;
                return baseScore - scoreReduction;
            }

            for (let i = 0; i < game.guessersList.length; i++) {
                const playerName = game.guessersList[i];
                const score = calculateScore(i);
                const player = game.players.find(p => p.playerName === playerName);
                if (player) {
                    player.score += score;
                }
            }

            const chosenPlayerObj = game.players.find(p => p.playerName === game.chosenPlayer);
            if (chosenPlayerObj && game.guessersList.length > 0) {
                chosenPlayerObj.score += 100;
            }

            const scoreBoard = game.players.map(p => [p.playerName, p.score]);
            scoreBoard.sort((a, b) => b[1] - a[1]);
            
            await Game.findOneAndUpdate({ roomCode }, { $set: { players: game.players, scoreBoard } });

            io.to(roomCode).emit('scoreBoard', scoreBoard);
            io.to(roomCode).emit('roundComplete', {
                roundPlayer: game.chosenPlayer,
                word: game.wordToDraw,
                guessers: game.guessersList,
                scores: game.scoreBoard,
                roundNumber: game.roundNumber + 1,
                totalRounds: game.totalRounds
            });

            setTimeout(() => {
                gameStart(roomCode);
            }, 3000);

        } catch (err) {
            console.error(err.message);
        }
        
        function chooseWordtimer(roomCode) {
            const state = getRoomState(roomCode);
            return new Promise((res) => {
                state.cancelChooseWordTimer = res;
                const t = setTimeout(() => {
                    console.log("Word selection time expired");
                    res();
                    clearTimeout(t);
                }, (chooseWordTime * 1000) + 10);
                state.chooseTimerID = t;
            });
        }

        function Drawingtimer(roomCode) {
            const state = getRoomState(roomCode);
            return new Promise((res) => {
                state.cancelDrawTimer = res;
                const t = setTimeout(() => {
                    console.log("Drawing time expired");
                    res();
                    clearTimeout(t);
                }, (drawTime * 1000) + 10);
                state.drawTimerID = t;
            });
        }
    }

    async function gameStart(roomCode) {
        try {
            let game = await Game.findOne({ roomCode });
            if (!game) return;

            if (game.roundNumber >= game.totalRounds) {
                const finalScores = [...game.scoreBoard].sort((a, b) => b[1] - a[1]);
                io.to(roomCode).emit('gameOver', finalScores);
                return;
            }

            if (game.playerIndex < game.players.length) {
                const chosenPlayer = game.players[game.playerIndex].playerName;
                const state = getRoomState(roomCode);
                state.wordOptions = [];
                for (let i = 0; i < 3; i++) {
                    state.wordOptions.push(random_word_gen());
                }
                
                game = await Game.findOneAndUpdate(
                    { roomCode },
                    { $set: { chosenPlayer }, $inc: { playerIndex: 1 } },
                    { new: true }
                );

                io.to(roomCode).emit('chosenPlayer', [game.chosenPlayer, game.roundNumber]);
                const player = game.players.find(p => p.playerName === game.chosenPlayer);
                if (player) {
                    io.to(player.socID).emit('wordList', [state.wordOptions, game.roundNumber]);
                }

                Fun(roomCode);
            } else {
                await Game.updateOne({ roomCode }, { $set: { playerIndex: 0 }, $inc: { roundNumber: 1 } });
                gameStart(roomCode);
            }
        } catch (err) {
            console.error(err.message);
        }
    }

});



// Start the server only after DB connection success
const port = process.env.PORT || 3000;

connectDB()
  .then(() => {
    isDbConnected = true;
    server.listen(port, () => {
      console.log(`Listening on port ${port}...`);
      console.log(`Open -> http://localhost:${port} to play :)`)
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB. Server not started.');
  });

// Serve React app for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});
