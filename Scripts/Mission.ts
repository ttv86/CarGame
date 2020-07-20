import Vehicle from "./WorldEntities/Vehicle";
import Game from "./Game";

type InitLineFunction = (line: number, hasOne: boolean, coordinates: ICoordinates, ...params: number[]) => unknown;
export default class Mission {
    private game: Game;

    private initMap: Record<string, InitLineFunction> = {
        "ALT_DAMAGE_TRIG": this.initAltDamageTrig as InitLineFunction,
        "BARRIER": this.initBarrier as InitLineFunction,
        "BASIC_BARRIER": this.initBasicBarrier as InitLineFunction,
        "BLOCK_INFO": this.initBlockInfo as InitLineFunction,
        "BOMBSHOP": this.initBombshop as InitLineFunction,
        "BOMBSHOP_COST": this.initBombshopCost as InitLineFunction,
        "CANNON_START": this.initCannonStart as InitLineFunction,
        "CARBOMB_TRIG": this.initCarbombTrig as InitLineFunction,
        "CARDESTROY_TRIG": this.initCardestroyTrig as InitLineFunction,
        "CARSTUCK_TRIG": this.initCarstuckTrig as InitLineFunction,
        "CARTRIGGER": this.initCartrigger as InitLineFunction,
        "CARWAIT_TRIG": this.initCarwaitTrig as InitLineFunction,
        "CHOPPER_ENDPOINT": this.initChopperEndpoint as InitLineFunction,
        "CORRECT_CAR_TRIG": this.initCorrectCarTrig as InitLineFunction,
        "CORRECT_MOD_TRIG": this.initCorrectModTrig as InitLineFunction,
        "COUNTER": this.initCounter as InitLineFunction,
        "CRANE": this.initCrane as InitLineFunction,
        "DAMAGE_TRIG": this.initDamageTrig as InitLineFunction,
        "DOOR": this.initDoor as InitLineFunction,
        "DUM_MISSION_TRIG": this.initDumMissionTrig as InitLineFunction,
        "DUM_PED_BLOCK_TRIG": this.initDumPedBlockTrig as InitLineFunction,
        "DUMMY": this.initDummy as InitLineFunction,
        "FINAL_MULTI": this.initFinalMulti as InitLineFunction,
        "FUTURE": this.initFuture as InitLineFunction,
        "FUTURECAR": this.initFuturecar as InitLineFunction,
        "FUTUREPED": this.initFutureped as InitLineFunction,
        "GTA_DEMAND": this.initGtaDemand as InitLineFunction,
        "GUN_SCREEN_TRIG": this.initGunScreenTrig as InitLineFunction,
        "GUN_TRIG": this.initGunTrig as InitLineFunction,
        "HELLS": this.initHells as InitLineFunction,
        "MID_MULTI_SETUP": this.initMidMultiSetup as InitLineFunction,
        "MIDPOINT_MULTI": this.initMidpointMulti as InitLineFunction,
        "MISSION_COUNTER": this.initMissionCounter as InitLineFunction,
        "MISSION_TOTAL": this.initMissionTotal as InitLineFunction,
        "MODEL_BARRIER": this.initModelBarrier as InitLineFunction,
        "MOVING_TRIG": this.initMovingTrig as InitLineFunction,
        "MOVING_TRIG_HIRED": this.initMovingTrigHired as InitLineFunction,
        "MPHONES": this.initMphones as InitLineFunction,
        "OBJECT": this.initObject as InitLineFunction,
        "PARKED": this.initParked as InitLineFunction,
        "PARKED_PIXELS": this.initParkedPixels as InitLineFunction,
        "PED": this.initPed as InitLineFunction,
        "PEDCAR_TRIG": this.initPedcarTrig as InitLineFunction,
        "PHONE_TOGG": this.initPhoneTogg as InitLineFunction,
        "PLAYER": this.initPlayer as InitLineFunction,
        "POWERUP": this.initPowerup as InitLineFunction,
        "SECRET_MISSION_COUNTER": this.initSecretMissionCounter as InitLineFunction,
        "SPECIFIC_BARR": this.initSpecificBarr as InitLineFunction,
        "SPECIFIC_DOOR": this.initSpecificDoor as InitLineFunction,
        "SPRAY": this.initSpray as InitLineFunction,
        "TARGET": this.initTarget as InitLineFunction,
        "TARGET_SCORE": this.initTargetScore as InitLineFunction,
        "TELEPHONE": this.initTelephone as InitLineFunction,
        "TRIGGER": this.initTrigger as InitLineFunction,
    };

    private commandMap: Record<string, (line: number, ...params: number[]) => unknown> = {
        "ADD_A_LIFE": this.commandAddALife,
        "ANSWER": this.commandAnswer,
        "ARMEDMESS": this.commandArmedmess,
        "ARROW": this.commandArrow,
        "ARROW_OFF": this.commandArrowOff,
        "ARROWCAR": this.commandArrowcar,
        "ARROWPED": this.commandArrowped,
        "BANK_ALARM_OFF": this.commandBankAlarmOff,
        "BANK_ALARM_ON": this.commandBankAlarmOn,
        "BANK_ROBBERY": this.commandBankRobbery,
        "BRIEF": this.commandBrief,
        "CANCEL_BRIEFING": this.commandCancelBriefing,
        "CAR_ON": this.commandCarOn,
        "CHANGE_BLOCK": this.commandChangeBlock,
        "CHANGE_PED_TYPE": this.commandChangePedType,
        "CHANGE_TYPE": this.commandChangeType,
        "CHECK_CAR": this.commandCheckCar,
        "CLOSE_DOOR": this.commandCloseDoor,
        "COMPARE": this.commandCompare,
        "CRANE": this.commandCrane,
        "DEAD_ARRESTED": this.commandDeadArrested,
        "DECCOUNT": this.commandDeccount,
        "DESTROY": this.commandDestroy,
        "DISABLE": this.commandDisable,
        "DISARMMESS": this.commandDisarmmess,
        "DO_GTA": this.commandDoGta,
        "DO_MODEL": this.commandDoModel,
        "DO_REPO": this.commandDoRepo,
        "DONOWT": this.commandDonowt,
        "DOOR_OFF": this.commandDoorOff,
        "DOOR_ON": this.commandDoorOn,
        "DROP_ON": this.commandDropOn,
        "DROP_WANTED_LEVEL": this.commandDropWantedLevel,
        "DUMMY_DRIVE_ON": this.commandDummyDriveOn,
        "DUMMYON": this.commandDummyon,
        "ENABLE": this.commandEnable,
        "END": this.commandEnd,
        "EXPL_NO_FIRE": this.commandExplNoFire,
        "EXPL_PED": this.commandExplPed,
        "EXPLODE": this.commandExplode,
        "EXPLODE_CAR": this.commandExplodeCar,
        "FREEUP_CAR": this.commandFreeupCar,
        "FREEZE_ENTER": this.commandFreezeEnter,
        "FREEZE_TIMED": this.commandFreezeTimed,
        "FRENZY_BRIEF": this.commandFrenzyBrief,
        "FRENZY_CHECK": this.commandFrenzyCheck,
        "FRENZY_SET": this.commandFrenzySet,
        "GENERAL_ONSCREEN": this.commandGeneralOnscreen,
        "GET_CAR_INFO": this.commandGetCarInfo,
        "GET_DRIVER_INFO": this.commandGetDriverInfo,
        "GOTO": this.commandGoto,
        "GOTO_DROPOFF": this.commandGotoDropoff,
        "HELL_ON": this.commandHellOn,
        "HUNTOFF": this.commandHuntoff,
        "HUNTON": this.commandHunton,
        "INC_HEADS": this.commandIncHeads,
        "INCCOUNT": this.commandInccount,
        "IS_GOAL_DEAD": this.commandIsGoalDead,
        "IS_PED_ARRESTED": this.commandIsPedArrested,
        "IS_PED_IN_CAR": this.commandIsPedInCar,
        "IS_PED_STUNNED": this.commandIsPedStunned,
        "IS_PLAYER_ON_TRAIN": this.commandIsPlayerOnTrain,
        "IS_POWERUP_DONE": this.commandIsPowerupDone,
        "KEEP_THIS_PROC": this.commandKeepThisProc,
        "KF_BRIEF_GENERAL": this.commandKfBriefGeneral,
        "KF_BRIEF_TIMED": this.commandKfBriefTimed,
        "KF_CANCEL_BRIEFING": this.commandKfCancelBriefing,
        "KF_CANCEL_GENERAL": this.commandKfCancelGeneral,
        "KF_PROCESS": this.commandKfProcess,
        "KICKSTART": this.commandKickstart,
        "KILL_CAR": this.commandKillCar,
        "KILL_DROP": this.commandKillDrop,
        "KILL_OBJ": this.commandKillObj,
        "KILL_PED": this.commandKillPed,
        "KILL_PROCESS": this.commandKillProcess,
        "KILL_SIDE_PROC": this.commandKillSideProc,
        "KILL_SPEC_PROC": this.commandKillSpecProc,
        "LOCATE": this.commandLocate,
        "LOCK_DOOR": this.commandLockDoor,
        "MAKEOBJ": this.commandMakeobj,
        "MESSAGE_BRIEF": this.commandMessageBrief,
        "MISSION_END": this.commandMissionEnd,
        "MOBILE_BRIEF": this.commandMobileBrief,
        "MODEL_HUNT": this.commandModelHunt,
        "MPHONE": this.commandMphone,
        "NEXT_KICK": this.commandNextKick,
        "OBTAIN": this.commandObtain,
        "OPEN_DOOR": this.commandOpenDoor,
        "P_BRIEF": this.commandPBrief,
        "P_BRIEF_TIMED": this.commandPBriefTimed,
        "PARK": this.commandPark,
        "PARKED_ON": this.commandParkedOn,
        "PARKED_PIXELS_ON": this.commandParkedPixelsOn,
        "PED_BACK": this.commandPedBack,
        "PED_ON": this.commandPedOn,
        "PED_OUT_OF_CAR": this.commandPedOutOfCar,
        "PED_POLICE": this.commandPedPolice,
        "PED_SENDTO": this.commandPedSendto,
        "PED_WEAPON": this.commandPedWeapon,
        "PIXEL_CAR_ON": this.commandPixelCarOn,
        "PLAIN_EXPL_BUILDING": this.commandPlainExplBuilding,
        "PLAYER_ARE_BOTH_ONSCREEN": this.commandPlayerAreBothOnscreen,
        "POWERUP_OFF": this.commandPowerupOff,
        "POWERUP_ON": this.commandPowerupOn,
        "RED_ARROW": this.commandRedArrow,
        "RED_ARROW_OFF": this.commandRedArrowOff,
        "REMAP_PED": this.commandRemapPed,
        "RESET": this.commandReset,
        "RESET_KF": this.commandResetKf,
        "RESET_WITH_BRIEFS": this.commandResetWithBriefs,
        "RETURN_CONTROL": this.commandReturnControl,
        "SCORE_CHECK": this.commandScoreCheck,
        "SENDTO": this.commandSendto,
        "SET_KILLTRIG": this.commandSetKilltrig,
        "SET_NO_COLLIDE": this.commandSetNoCollide,
        "SET_PED_SPEED": this.commandSetPedSpeed,
        "SETBOMB": this.commandSetbomb,
        "SETUP_REPO": this.commandSetupRepo,
        "SPEECH_BRIEF": this.commandSpeechBrief,
        "START_MODEL": this.commandStartModel,
        "STARTUP": this.commandStartup,
        "STEAL": this.commandSteal,
        "STOP_FRENZY": this.commandStopFrenzy,
        "SURVIVE": this.commandSurvive,
        "THROW": this.commandThrow,
        "UNFREEZE_ENTER": this.commandUnfreezeEnter,
        "UNLOCK_DOOR": this.commandUnlockDoor,
        "WAIT_FOR_PED": this.commandWaitForPed,
        "WAIT_FOR_PLAYERS": this.commandWaitForPlayers,
        "WRECK_A_TRAIN": this.commandWreckATrain,
    };

    private initReferences = new Map<number, unknown>();
    private commandReferences = new Map<number, unknown>();

    constructor(game: Game) {
        this.game = game;
    }

    public runInitLine(commandName: string, lineReference: number, hasOne: boolean, coordinates: ICoordinates, ...parameters: number[]) {
        const func = this.initMap[commandName];
        if (func) {
            const result = func(lineReference, hasOne, coordinates, ...parameters);
            if ((result !== void 0) && (result !== null)) {
                this.initReferences.set(lineReference, result);
            }
        }
    }

    public runCommandLine(commandName: string, lineReference: number, ...parameters: number[]) {
        const func = this.commandMap[commandName];
        if (func) {
            const result = func(lineReference, ...parameters);
            if ((result !== void 0) && (result !== null)) {
                this.commandReferences.set(lineReference, result);
            }
        }
    }

    /**
     * Unknown function. Used 1 times.
     * @param line Line number of command.
     * @param hasOne Always false.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Always 1052
     * @param param2 Unknown parameter. Always 2
     */
    private initAltDamageTrig(line: number, hasOne: never, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 24 times.
     * @param line Line number of command.
     * @param hasOne Always true.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Possible values: 2, 0, 3
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 7, 4
     * @param param3 Unknown parameter. Always 0
     */
    private initBarrier(line: number, hasOne: never, coordinates: ICoordinates, param1: number, param2: number, param3: number): void {
    }

    /**
     * Unknown function. Used 4 times.
     * @param line Line number of command.
     * @param hasOne Always true.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Possible values: 2, 0
     * @param param2 Unknown parameter. Always 4
     * @param param3 Unknown parameter. Always 0
     */
    private initBasicBarrier(line: number, hasOne: never, coordinates: ICoordinates, param1: number, param2: number, param3: number): void {
    }

    /**
     * Unknown function. Used 253 times.
     * @param line Line number of command.
     * @param hasOne True if line has mysterious one in front.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 0, 4, 48, 1, 2, 3
     * @param param2 Unknown parameter. Could be init line reference. Possible values: 0, 100, 8
     */
    private initBlockInfo(line: number, hasOne: boolean, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 56 times.
     * @param line Line number of command.
     * @param hasOne Always true.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Always 0
     */
    private initBombshop(line: number, hasOne: never, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 1 times.
     * @param line Line number of command.
     * @param hasOne Always true.
     * @param coordinates. Not used.
     * @param param1 Unknown parameter. Always 1000
     * @param param2 Unknown parameter. Always 0
     */
    private initBombshopCost(line: number, hasOne: never, coordinates: never, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 9 times.
     * @param line Line number of command.
     * @param hasOne Always false.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Always 0
     */
    private initCannonStart(line: number, hasOne: never, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 9 times.
     * @param line Line number of command.
     * @param hasOne Always false.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 3100, 162, 1675, 365, 374, 20912, 1000, 15050, 16030
     * @param param2 Unknown parameter. Possible values: 1032, 1445, 6744, 4033, 6082, 8440, 1069, 25320, 26200
     */
    private initCarbombTrig(line: number, hasOne: never, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 23 times.
     * @param line Line number of command.
     * @param hasOne True if line has mysterious one in front.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 5700, 6525, 6565, 6605, 7940, 2225, 6100, 7430, 7450, 7470, 7490, 3540, 3560, 8100, 3502, 7291, 7391, 7491, 7591, 17360, 22530, 25390, 26320
     * @param param2 Unknown parameter. Possible values: 2, 1, 4, 3
     * @param param3 Unknown parameter. Could be init line reference. Possible values: 213, 1510, 1520, 1530, 1610, 283, 374, 395, 396, 397, 398, 340, 342, 20912, 2000, 4040, 4050, 4060, 4070, 8000, 12040, 15050, 16030
     */
    private initCardestroyTrig(line: number, hasOne: boolean, coordinates: ICoordinates, param1: number, param2: number, param3: number): void {
    }

    /**
     * Unknown function. Used 5 times.
     * @param line Line number of command.
     * @param hasOne Always false.
     * @param coordinates. Not used.
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 280, 2650, 4079, 3577, 25680
     * @param param2 Unknown parameter. Could be init line reference. Possible values: 175, 483, 365, 2000, 15010
     */
    private initCarstuckTrig(line: number, hasOne: never, coordinates: never, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 71 times.
     * @param line Line number of command.
     * @param hasOne True if line has mysterious one in front.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Possible values: 3000, 2000, 4000, 2500, 3500, 5000, 6000, 31220, 19000, 10000, 3600, 8000, 7000, 9000, 100, 17035, 11000, 11100, 11200, 11300, 12000, 12100, 6510, 6550, 6590, 1000, 1020, 1040, 2900, 2910, 2920, 2930, 2940, 2950, 2960, 2970, 2980, 2990, 600, 702, 10600, 31038, 31138, 29938, 17050, 28000, 28030, 28060, 29000, 29100, 29200, 29300, 29400, 29500, 29600, 29700, 29800, 29900, 32538, 32638, 32438
     * @param param2 Unknown parameter. Could be init line reference. Possible values: 196, 238, 256, 295, 297, 485, 502, 139, 209, 213, 219, 246, 251, 333, 348, 374, 578, 2500, 2530, 2550, 2580, 2730, 2750, 1510, 1520, 1530, 182, 184, 186, 299, 301, 303, 305, 307, 309, 311, 313, 3000, 8020, 464, 18700, 18720, 18740, 300, 802, 8000, 18280, 18300, 18320, 18440, 18460, 18480, 18500, 18520, 18540, 18560, 18580, 18600, 18620
     */
    private initCartrigger(line: number, hasOne: boolean, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 22 times.
     * @param line Line number of command.
     * @param hasOne Always false.
     * @param coordinates. Not used.
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 577, 613, 872, 6280, 6455, 5900, 3439, 3920, 4000, 4110, 4860, 5870, 6200, 6837, 13719, 4093, 3534, 23350, 23450, 23550, 23650, 25690
     * @param param2 Unknown parameter. Could be init line reference. Possible values: 131, 136, 3280, 238, 242, 212, 920, 950, 960, 970, 1272, 1380, 1410, 1610, 1000, 365, 2000, 13000, 13010, 13030, 13040, 15010
     */
    private initCarwaitTrig(line: number, hasOne: never, coordinates: never, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param hasOne True if line has mysterious one in front.
     * @param coordinates. Command coordinates in pixels. (0-16383)
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Always 0
     */
    private initChopperEndpoint(line: number, hasOne: boolean, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 55 times.
     * @param line Line number of command.
     * @param hasOne True if line has mysterious one in front.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 628, 3200, 3360, 3490, 3620, 3170, 3330, 3460, 3590, 6910, 6850, 257, 5665, 3260, 3222, 5560, 5562, 5564, 21610, 21810, 22010, 22210, 1672, 2480, 2623, 1812, 1952, 2092, 4073, 4053, 4042, 7090, 7180, 7280, 7380, 8050, 10106, 2475, 11510, 11982, 13391, 8480, 32390, 32393, 32396, 9241, 9243, 9700, 1110, 17120, 17160, 25140, 25370, 26240
     * @param param2 Unknown parameter. Could be init line reference. Possible values: 2, 0, 1, 12, 6, 4, 7
     * @param param3 Unknown parameter. Could be init line reference. Possible values: 136, 190, 191, 192, 193, 248, 118, 213, 920, 1375, 7310, 7330, 7350, 7370, 249, 279, 283, 250, 251, 252, 365, 395, 396, 397, 398, 408, 445, 650, 652, 1030, 20912, 208, 425, 1000, 2000, 8000, 15030, 15050, 16030
     */
    private initCorrectCarTrig(line: number, hasOne: boolean, coordinates: ICoordinates, param1: number, param2: number, param3: number): void {
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param hasOne Always false.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 5062, 24080
     * @param param2 Unknown parameter. Always 1
     * @param param3 Unknown parameter. Could be init line reference. Possible values: 4, 22
     */
    private initCorrectModTrig(line: number, hasOne: never, coordinates: ICoordinates, param1: number, param2: number, param3: number): void {
    }

    /**
     * Unknown function. Used 169 times.
     * @param line Line number of command.
     * @param hasOne True if line has mysterious one in front.
     * @param coordinates. Not used.
     * @param param1 Unknown parameter. Possible values: 0, 6, 4, 12, 3, 9, 1, 15, 2, 10, 5, 7, 17
     * @param param2 Unknown parameter. Always 0
     */
    private initCounter(line: number, hasOne: boolean, coordinates: never, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 24 times.
     * @param line Line number of command.
     * @param hasOne Always true.
     * @param coordinates. Command coordinates in pixels. (0-16383)
     * @param param1 Unknown parameter. Could be command line reference. Could be init line reference. Possible values: 1, -1
     * @param param2 Unknown parameter. Could be angle. Possible values: 512, 0
     */
    private initCrane(line: number, hasOne: never, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param hasOne Always false.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 6752, 23180
     * @param param2 Unknown parameter. Always 1
     */
    private initDamageTrig(line: number, hasOne: never, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 171 times.
     * @param line Line number of command.
     * @param hasOne True if line has mysterious one in front.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 1, 0, 2, 3
     * @param param2 Unknown parameter. Possible values: 11, 4, 22
     * @param param3 Unknown parameter. Could be init line reference. Possible values: 7, 0, 8
     */
    private initDoor(line: number, hasOne: boolean, coordinates: ICoordinates, param1: number, param2: number, param3: number): void {
    }

    /**
     * Unknown function. Used 68 times.
     * @param line Line number of command.
     * @param hasOne True if line has mysterious one in front.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Possible values: 1065, 5390, 5500, 5380, 9705, 9720, 9740, 5400, 5420, 5440, 1980, 1900, 1930, 1950, 8500, 8520, 8350, 8380, 8400, 9580, 7500, 7520, 7540, 7070, 7100, 7120, 16500, 16520, 16220, 16250, 16270, 17300, 17320, 17340, 17360, 17150, 7700, 7720, 7300, 590, 17600, 364, 370, 380, 390, 424, 430, 440, 450, 5860, 6230, 6300, 6722, 6727, 234, 241, 1595, 1598, 1601, 1607, 1610, 5049, 2583, 1604, 13080, 3150, 24160, 25520
     * @param param2 Unknown parameter. Possible values: 3, 4, 1, 2, 0
     * @param param3 Unknown parameter. Could be init line reference. Possible values: 230, 215, 277, 234, 260, 335, 567, 579, 319, 131, 3720, 225, 250, 1380, 1410, 1610, 175, 251, 252, 365, 483, 1000, 2000, 14010, 15010
     */
    private initDumMissionTrig(line: number, hasOne: boolean, coordinates: ICoordinates, param1: number, param2: number, param3: number): void {
    }

    /**
     * Unknown function. Used 3 times.
     * @param line Line number of command.
     * @param hasOne Always false.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 2440, 31100, 31110
     * @param param2 Unknown parameter. Possible values: 2, 3
     * @param param3 Unknown parameter. Could be init line reference. Possible values: 741, 9500
     */
    private initDumPedBlockTrig(line: number, hasOne: never, coordinates: ICoordinates, param1: number, param2: number, param3: number): void {
    }

    /**
     * Unknown function. Used 397 times.
     * @param line Line number of command.
     * @param hasOne True if line has mysterious one in front.
     * @param coordinates. Command coordinates in pixels. (0-16383)
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Possible values: 1, 0, 3, 2
     */
    private initDummy(line: number, hasOne: boolean, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 9 times.
     * @param line Line number of command.
     * @param hasOne Always false.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Always 2
     * @param param2 Unknown parameter. Always 0
     */
    private initFinalMulti(line: number, hasOne: never, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 85 times.
     * @param line Line number of command.
     * @param hasOne True if line has mysterious one in front.
     * @param coordinates. Command coordinates in pixels. (0-16383)
     * @param param1 Unknown parameter. Possible values: 41, 47, 88, 94
     * @param param2 Unknown parameter. Could be angle. Possible values: 0, 768, 256
     */
    private initFuture(line: number, hasOne: boolean, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 227 times.
     * @param line Line number of command.
     * @param hasOne True if line has mysterious one in front.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Possible values: 43, 18, 4, 41, 44, 22, 34, 1, 17, 5, 0, 13, 35, 19, 9, 29, 27, 31, 6, 2, 26, 62, 55, 58, 65, 54, 66, 64, 51, 63, 7, 50, 86, 61, 45, 42, 70, 3, 74, 87, 82, 78, 77, 46, 81, 83, 72, 73, 80, 75
     * @param param2 Unknown parameter. Could be angle. Possible values: 512, 256, 768, 0
     */
    private initFuturecar(line: number, hasOne: boolean, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 424 times.
     * @param line Line number of command.
     * @param hasOne True if line has mysterious one in front.
     * @param coordinates. Command coordinates in pixels. (0-16383)
     * @param param1 Unknown parameter. Possible values: 0, 4, 22, 2, 9, 21, 23, 14, 5, 46, 24, 1, 12, 26
     * @param param2 Unknown parameter. Possible values: 0, 512, 256, 768, 2
     */
    private initFutureped(line: number, hasOne: boolean, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 6 times.
     * @param line Line number of command.
     * @param hasOne Always true.
     * @param coordinates. Not used.
     * @param param1 Unknown parameter. Possible values: 0, 2, 3
     * @param param2 Unknown parameter. Possible values: 18, 22, 27
     * @param param3 Unknown parameter. Always -1
     * @param param4 Unknown parameter. Always 2
     */
    private initGtaDemand(line: number, hasOne: never, coordinates: never, param1: number, param2: number, param3: number, param4: number): void {
    }

    /**
     * Unknown function. Used 23 times.
     * @param line Line number of command.
     * @param hasOne Always false.
     * @param coordinates. Not used.
     * @param param1 Unknown parameter. Possible values: 2050, 6990, 1220, 3910, 3980, 4060, 4170, 6855, 7210, 270, 275, 3610, 5500, 5210, 5560, 7320, 7420, 7520, 7620, 16380, 21943, 21963, 21973
     * @param param2 Unknown parameter. Could be init line reference. Possible values: 169, 250, 3070, 980, 990, 1000, 1005, 1686, 1810, 180, 213, 2000, 3000, 4000, 4010, 4020, 4030, 7040, 11030, 11070, 11090
     */
    private initGunScreenTrig(line: number, hasOne: never, coordinates: never, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 20 times.
     * @param line Line number of command.
     * @param hasOne True if line has mysterious one in front.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 1710, 520, 1320, 9961, 250, 7951, 10510, 10520, 14994, 3779, 8402, 9095, 18430, 18440, 18450, 18504, 18510, 18514, 23300, 31391
     * @param param2 Unknown parameter. Possible values: 3, 2, 1, 5, 0
     */
    private initGunTrig(line: number, hasOne: boolean, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Creates a gang member on vehicle.
     * @param line Line number of command.
     * @param hasOne Always false.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param carType Type of the car
     * @param angle Angle of the car.
     */
    private initHells(line: number, hasOne: never, coordinates: ICoordinates, carType: number, angle: number): void {
    }

    /**
     * Unknown function. Used 9 times.
     * @param line Line number of command.
     * @param hasOne Always false.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Always 10
     * @param param2 Unknown parameter. Always 0
     */
    private initMidMultiSetup(line: number, hasOne: never, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 51 times.
     * @param line Line number of command.
     * @param hasOne Always false.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
     * @param param2 Unknown parameter. Could be init line reference. Possible values: 2, 1, 3
     */
    private initMidpointMulti(line: number, hasOne: never, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 8 times.
     * @param line Line number of command.
     * @param hasOne True if line has mysterious one in front.
     * @param coordinates. Not used.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 4, 5, 10, 16
     * @param param2 Unknown parameter. Always 0
     */
    private initMissionCounter(line: number, hasOne: boolean, coordinates: never, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 7 times.
     * @param line Line number of command.
     * @param hasOne True if line has mysterious one in front.
     * @param coordinates. Not used.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 11, 13, 18, 16
     * @param param2 Unknown parameter. Always 0
     */
    private initMissionTotal(line: number, hasOne: boolean, coordinates: never, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param hasOne Always true.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Always 2
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Always 4
     * @param param4 Unknown parameter. Always 4
     */
    private initModelBarrier(line: number, hasOne: never, coordinates: ICoordinates, param1: number, param2: number, param3: number, param4: number): void {
    }

    /**
     * Unknown function. Used 8 times.
     * @param line Line number of command.
     * @param hasOne Always false.
     * @param coordinates. Not used.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 1730, 1740, 1750, 1760, 13000, 13010, 13020, 13030
     * @param param2 Unknown parameter. Possible values: 1, 0
     * @param param3 Unknown parameter. Always 4
     */
    private initMovingTrig(line: number, hasOne: never, coordinates: never, param1: number, param2: number, param3: number): void {
    }

    /**
     * Unknown function. Used 14 times.
     * @param line Line number of command.
     * @param hasOne Always false.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 131, 238, 242, 920, 950, 960, 970, 1272, 175, 483, 1000, 365, 2000, 15010
     * @param param2 Unknown parameter. Possible values: 1, 0
     */
    private initMovingTrigHired(line: number, hasOne: never, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 12 times.
     * @param line Line number of command.
     * @param hasOne Always true.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 27, 10, 15050, 17200, 17400, 110, 160, 195, 100, 200, 300
     * @param param2 Unknown parameter. Possible values: 3, 2
     */
    private initMphones(line: number, hasOne: never, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 1 times.
     * @param line Line number of command.
     * @param hasOne Always false.
     * @param coordinates. Command coordinates in pixels. (0-16383)
     * @param param1 Unknown parameter. Always 47
     * @param param2 Unknown parameter. Always 0
     */
    private initObject(line: number, hasOne: never, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Creates a parked car within the city.
     * @param line Line number of command.
     * @param hasOne True if line has mysterious one in front.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param carType Car type.
     * @param angle Angle of the parked car.
     */
    private initParked(line: number, hasOne: boolean, coordinates: ICoordinates, carType: number, angle: number): Vehicle | null {
        return this.initParkedPixels(line, hasOne, { x: coordinates.x * 64 + 32, y: coordinates.y * 64 + 32, z: coordinates.z * 64 + 32 }, carType, angle);
    }

    /**
     * Creates a parked car within the city.
     * @param line Line number of command.
     * @param hasOne True if line has mysterious one in front.
     * @param coordinates. Command coordinates in pixels. (0-16383)
     * @param carType Car type.
     * @param angle Angle of the parked car.
     */
    private initParkedPixels(line: number, hasOne: boolean, coordinates: ICoordinates, carType: number, angle: number): Vehicle | null {
        //const info = this.game.getVehicleInfo(carType);
        //if (info) {
        //    const vehicle = new Vehicle(coordinates.x / 64, coordinates.y / 64, coordinates.z / 64, angle, info);
        //    this.game.addToWorld(vehicle);
        //    return vehicle;
        //}

        return null;
    }

    /**
     * Unknown function. Used 39 times.
     * @param line Line number of command.
     * @param hasOne Always true.
     * @param coordinates. Command coordinates in pixels. (0-16383)
     * @param param1 Unknown parameter. Possible values: 0, 4, 5
     * @param param2 Unknown parameter. Could be angle. Possible values: 0, 256, 512, 768
     * @param param3 Unknown parameter. Possible values: 147, 145, 156, 154, 155, 172, 170, 171, 166, 167, 168, 158, 159, 160
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 5100, 5200, 5300, 5900, 6000, 6100, 470, 480, 490, 510, 520, 530, 550, 560, 570, 590, 600, 610
     */
    private initPed(line: number, hasOne: never, coordinates: ICoordinates, param1: number, param2: number, param3: number, param4?: number): void {
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param hasOne Always false.
     * @param coordinates. Not used.
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 1500, 1170
     * @param param2 Unknown parameter. Possible values: 165, 1020
     * @param param3 Unknown parameter. Could be init line reference. Possible values: 162, 1000
     */
    private initPedcarTrig(line: number, hasOne: never, coordinates: never, param1: number, param2: number, param3: number): void {
    }

    /**
     * Unknown function. Used 12 times.
     * @param line Line number of command.
     * @param hasOne Always true.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 192, 194, 81, 3540, 5840, 5940, 174, 600, 612, 220, 240, 260
     * @param param2 Unknown parameter. Possible values: 5, 4
     */
    private initPhoneTogg(line: number, hasOne: never, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 54 times.
     * @param line Line number of command.
     * @param hasOne True if line has mysterious one in front.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 293, 0, 1, 2, 3, 84, 208
     * @param param2 Unknown parameter. Could be angle. Possible values: 256, 512, 768, 0
     */
    private initPlayer(line: number, hasOne: boolean, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 2501 times.
     * @param line Line number of command.
     * @param hasOne True if line has mysterious one in front.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param powerupType Unknown parameter. Possible values: 1 - Pistol, 2 - Machine Gun, 3 - Rocket Launcher, 4 - Flame thrower, 6 - Car Speed Up, 9 - Bribe, 10 - Armor, 11 - Multiplier Up, 12 - Get Out Of Jail Free, 13 - Extra Life, 14 - Info sign, 15 - Extra life
     * @param ammoOrInfoNumber If powerupType is Info Sign, tells what info is shown. Value 1 - 99 is ammo. Value > 99 starts a frenzy.
     */
    private initPowerup(line: number, hasOne: boolean, coordinates: ICoordinates, powerupType: number, ammoOrInfoNumber: number): void {
    }

    /**
     * Sets level secret mission count.
     * @param line Line number of command.
     * @param hasOne True if line has mysterious one in front.
     * @param coordinates. Not used.
     * @param initialMissionCount Number of secret missions when level starts.
     * @param param2 Unknown parameter. Always 0
     */
    private initSecretMissionCounter(line: number, hasOne: boolean, coordinates: never, initialMissionCount: number, param2: number): void {
        const counter = new Counter(initialMissionCount);
        counter.valueChange = (newValue) => this.game.secretMissions = newValue;
        this.game.secretMissions = initialMissionCount;
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param hasOne Always true.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Always 3
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Always 4
     * @param param4 Unknown parameter. Always 212
     * @param param5 Unknown parameter. Always -1
     */
    private initSpecificBarr(line: number, hasOne: never, coordinates: ICoordinates, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 19 times.
     * @param line Line number of command.
     * @param hasOne True if line has mysterious one in front.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Possible values: 2, 1, 3, 0
     * @param param2 Unknown parameter. Possible values: 4, 22
     * @param param3 Unknown parameter. Possible values: 0, 8
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 116, 118, 205, 136, 920, 6110, 244, 249, 250, 251, 252, 279, 243, 445, 463, 464, 1030, 14050, 15030
     * @param param5 Unknown parameter. Could be command line reference. Could be init line reference. Possible values: -1, 3
     */
    private initSpecificDoor(line: number, hasOne: boolean, coordinates: ICoordinates, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 110 times.
     * @param line Line number of command.
     * @param hasOne Always true.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Possible values: 1, 2, 3, 4, 5, 6
     * @param param2 Unknown parameter. Always 0
     */
    private initSpray(line: number, hasOne: never, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 171 times.
     * @param line Line number of command.
     * @param hasOne True if line has mysterious one in front.
     * @param coordinates. Command coordinates in pixels. (0-16383)
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 0, 9, 35
     * @param param2 Unknown parameter. Could be angle. Possible values: 0, 512, 256
     */
    private initTarget(line: number, hasOne: boolean, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Sets map target score.
     * @param line Line number of command.
     * @param hasOne True if line has mysterious one in front.
     * @param coordinates. Not used.
     * @param targetScore Target score to obtain.
     * @param param2 Unknown parameter. Always 0
     */
    private initTargetScore(line: number, hasOne: boolean, coordinates: never, targetScore: number, param2: number): void {
        this.game.targetScore = targetScore;
    }

    /**
     * Creates a telephone at given position
     * @param line Line number of command.
     * @param hasOne Always true.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Always 0
     * @param angle Angle of the telephone.
     */
    private initTelephone(line: number, hasOne: never, coordinates: ICoordinates, param1: never, angle: number): void {
    }

    /**
     * Unknown function. Used 1990 times.
     * @param line Line number of command.
     * @param hasOne True if line has mysterious one in front.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Possible values: 2635, 7300, 2060, 2221, 2300, 3150, 3210, 7250, 7000, 7050, 7100, 7150, 7200, 7500, 7600, 7700, 7800, 7900, 125, 645, 1048, 1225, 4281, 4120, 330, 4080, 375, 9000, 9080, 1, 3, 5, 7, 9, 8150, 5080, 9160, 9240, 9320, 9400, 10000, 6100, 31600, 31610, 31620, 31630, 31640, 31650, 31660, 31670, 31680, 31690, 31700, 1320, 31228, 325, 2525, 2260, 19110, 510, 580, 3220, 3140, 3060, 5100, 10100, 9210, 9525, 1790, 8240, 3690, 8125, 2140, 1420, 9130, 2450, 12000, 13000, 7120, 7465, 31450, 31470, 16340, 7230, 12080, 12160, 12240, 12320, 12400, 9405, 31000, 31400, 31410, 31420, 31430, 31440, 5300, 31500, 31510, 31520, 31530, 31540, 31550, 31560, 16065, 16450, 18480, 18300, 18120, 18195, 6050, 6265, 6105, 19405, 19655, 19570, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320, 340, 350, 360, 370, 380, 390, 400, 410, 420, 430, 440, 450, 460, 470, 480, 490, 500, 520, 530, 540, 550, 560, 570, 590, 600, 610, 620, 630, 640, 650, 660, 670, 680, 690, 700, 710, 720, 730, 740, 750, 760, 770, 780, 790, 800, 810, 820, 830, 840, 850, 860, 870, 880, 890, 900, 910, 920, 930, 940, 950, 960, 970, 980, 990, 1000, 1010, 1020, 1030, 1040, 1050, 1060, 1070, 1080, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 3200, 3300, 3400, 3500, 3600, 3700, 3800, 3900, 4000, 4100, 4200, 4300, 4400, 4500, 4600, 4700, 4800, 4900, 5000, 5200, 5400, 5500, 5600, 5700, 5800, 5900, 6000, 6200, 6300, 6400, 6500, 6600, 6700, 6800, 6900, 7400, 8000, 8100, 8200, 8300, 8400, 8500, 8600, 8700, 8800, 8900, 9100, 9200, 9300, 9500, 9600, 9700, 9800, 9900, 10200, 10300, 10400, 10500, 10600, 10700, 10800, 12, 145, 1335, 1460, 282, 4040, 8040, 2720, 11400, 11500, 11600, 11700, 11800, 11900, 215, 605, 15090, 15170, 15250, 15330, 17710, 15428, 27000, 27060, 27120, 27180, 27240, 27300, 27360, 27420, 27480, 27540, 27600, 27660, 27720, 27780, 15400, 1932, 1936, 1940, 1954, 28000, 28030, 28060, 28090, 28120, 28150, 28180, 28210, 28240, 28270, 28300, 28330, 28360, 28390, 28420, 28450, 28480, 28510, 28540, 28570, 29000, 29010, 29100, 29200, 2547, 2551, 2555, 2559, 1380, 1482, 1490, 2320, 2340, 5575, 6702, 6739, 0, 7615, 7640, 10900, 10040, 10140, 10240, 10340, 10440, 10540, 10640, 10740, 30000, 30060, 30120, 30180, 30240, 30300, 30360, 30420, 30480, 30540, 30600, 30660, 30720, 30780, 28010, 28050, 33000, 33030, 33060, 33090, 33120, 33150, 33180, 33210, 33240, 33270, 33300, 33330, 33360, 33390, 33420, 33450, 33480, 33510, 33540, 33570, 36000, 36010, 36100, 36200, 999, 2010, 2020, 2030, 2040, 2050, 2070, 2080, 2090, 2110, 2120, 2130, 2150, 2160, 2170, 2180, 2190, 2210, 2220, 2230, 2240, 2250, 2280, 2290, 2310, 2330, 2350, 2360, 2370, 2380, 2390, 2410, 2420, 2430, 2440, 2460, 2470, 2480, 2490, 2510, 2520, 2530, 2540, 2550, 2560, 2570, 2580, 2590, 2610, 2620, 2630, 2640, 2650, 2660, 2670, 2680, 2690, 2710, 2730, 2740, 2750, 2760, 2770, 2780, 2790, 2810, 2820, 2830, 2840, 2850, 2860, 2870, 2880, 2890, 2910, 2920, 2930, 2940, 2950, 2960, 2970, 2980, 2990, 3010, 3020, 3030, 3040, 3050, 3070, 3080, 3090, 3110, 3120, 3130, 3160, 3170, 3180, 3190, 3230, 3240, 3250, 3260, 3270, 3280, 3290, 3310, 3320, 3330, 3340, 3350, 3360, 3380, 32000, 10, 13010, 3773, 3776, 6077, 7002, 11530, 476, 487, 498, 501, 10530, 14992, 9253, 9257, 9261, 9265, 31547, 31587, 31627, 31667, 31707, 31787, 31827, 31907, 31947, 32207, 304, 20000, 20010, 20020, 20030, 20040, 20050, 20060, 20070, 20080, 20090, 20100, 20110, 20120, 2614, 27200, 27400, 1007, 416, 432, 448, 462, 1440, 1590, 1730, 1760, 5011, 16220, 16280, 16330, 18084, 18420, 18500, 20064, 20094, 20144, 20183, 21210, 22110, 22150, 22204, 22176, 24000, 25000, 26000, 26050, 26110, 26314, 31390, 31747, 31867, 27103, 2270, 3370
     * @param param2 Unknown parameter. Possible values: 0, 2, 1, 3, 4, 5, 6, 8, 31
     */
    private initTrigger(line: number, hasOne: boolean, coordinates: ICoordinates, param1: number, param2: number): void {

    }

    /**
     * Unknown function. Used 24 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Always -1
     * @param param4 Unknown parameter. Always -1
     * @param param5 Unknown parameter. Always 0
     */
    private commandAddALife(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 47 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 72, 105, 86, 38, 16, 112, 121, 56, 32, 44, 60, 57, 42, 17, 18, 41, 61, 78, 59, 55, 52, 30, 63, 43, 64, 13, 37, 6, 90, 14, 79, 104, 33, 11, 34
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 1735, 1766, 1796, 1830
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 420, 792, 1800, 4260, 4270, 4280, 4290, 31239, 31250, 146, 1883, 2640, 4050, 8050, 15100, 15180, 15260, 15340, 10050, 10150, 10250, 10350, 10450, 10550, 10650, 10750, 305, 7001, 7999, 8999, 12999, 1450, 1510, 1600, 23999, 24999, 25999, 26060, 26120
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 10, 30, 5
     * @param param5 Unknown parameter. Possible values: 2500, 0, 1500, 5000, 10000, 1000
     */
    private commandAnswer(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 4 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandArmedmess(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Sets mission guide arrow to a specific object.
     * @param line Line number of command.
     * @param targetId Object to point to.
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 430, 447, 405, 940, 1425, 1432, 2490, 3480, 4500, 4510, 4530, 4540, 4550, -1, 970, 980, 2910, 2920, 2930, 6700, 6800, 7925, 7932, 8950, 9987, 9994, 16787, 16761, 16770, 16780, 17800, 18880, 18870, 19795, 19831, 19870, 31350, 326
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, 430, 447, 405, 940, 1425, 1432, 2490, 3480, 4500, 4510, 4530, 4540, 4550, -1, 970, 980, 2910, 2920, 2930, 6700, 6800, 7925, 7932, 8950, 9987, 9994, 16787, 16761, 16770, 16780, 17800, 18880, 18870, 19795, 19831, 19870, 31350
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Could be command line reference. Possible values: 0, 5000, 10000, 1000
     */
    private commandArrow(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 1041 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 0, 710, 720, 730
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 170, 892, 1450, 1297, 1850, -1, 2676, 4340, 8403, 5000, 294, 2770, 2810, 2850, 2890, 2930, 1021, 1735, 905, 2270, 325, 2700, 1000, 23500, 5505, 6200, 800, 840, 200, 6675, 21500, 22400, 3110, 5500, 20000, 1050, 7592, 10710, 10860, 13250, 32300, 5017
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, -1, 1450, 1297, 1850, 2676, 4340, 8403, 5000
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Possible values: 0, 20000, 50000, 2500, 25000, 10000, 5000, 30000, 1000, 3000
     */
    private commandArrowOff(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 245 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Possible values: 189, 253, 221, 230, 238, 198, 244, 297, 256, 295, 265, 152, 315, 319, 327, 273, 277, 270, 565, 373, 578, 579, 593, 628, 640, 196, 251, 209, 213, 139, 116, 118, 136, 131, 190, 191, 192, 193, 3720, 3240, 205, 162, 3100, 248, 212, 3280, 242, 200, 210, 215, 220, 225, 250, 920, 950, 960, 970, 1272, 1375, 1410, 1610, 1730, 1740, 1750, 1760, 6000, 6030, 6060, 6110, 6120, 6130, 6140, 6150, 7310, 7330, 7350, 7370, 175, 243, 249, 252, 279, 483, 283, 345, 365, 374, 395, 396, 397, 398, 408, 20912, 425, 445, 463, 464, 475, 479, 650, 652, 730, 1000, 1030, 1160, 2000, 8000, 11000, 11020, 11060, 12040, 13000, 13010, 13020, 13030, 13040, 14050, 15010, 15030, 15050, 16030
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 607, 6310, 6485, -1, 2648, 10650
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Could be init line reference. Possible values: 0, 1000
     */
    private commandArrowcar(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 170 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 252, 237, 384, 385, 386, 387, 388, 267, 268, 150, 152, 227, 228, 199, 225, 295, 255, 395, 271, 687, 597, 598, 600, 632, 135, 131, 183, 184, 185, 186, 187, 188, 3750, 3760, 3770, 3780, 163, 3022, 3024, 3026, 3028, 247, 250, 169, 254, 139, 3300, 238, 240, 242, 246, 172, 11800, 11810, 370, 741, 980, 990, 1000, 1005, 950, 960, 970, 1210, 1230, 1250, 1270, 1274, 1460, 1410, 1615, 1686, 1810, 1830, 6160, 6170, 6180, 6190, 6200, 6210, 6220, 6230, 7100, 7110, 7120, 7130, 7140, 7150, 7160, 7170, 180, 213, 281, 492, 339, 341, 343, 366, 376, 377, 378, 379, 430, 431, 447, 462, 476, 477, 478, 480, 481, 482, 670, 680, 690, 700, 710, 1160, 1180, 3000, 3020, 4000, 4030, 4020, 4010, 5000, 5010, 5020, 5030, 5040, 5050, 5060, 5070, 5080, 5090, 6040, 6050, 6070, 6080, 6100, 6110, 6130, 6140, 7040, 10000, 10020, 10050, 10080, 10110, 11070, 11030, 11090, 14040
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 440, 2342, 2390, 3470, 9980, 18860, 19860, -1, 17745, 6240, 3488, 19120
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, 440, 2342, 2390, 3470, 9980, 18860, 19860, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandArrowped(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 16 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 241, 208, 299, 161, 364
     * @param param2 Unknown parameter. Possible values: 0, -1
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandBankAlarmOff(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 5 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Possible values: 0, -1
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 241, 208, 299, 161, 364
     * @param param5 Unknown parameter. Always 0
     */
    private commandBankAlarmOn(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 13 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 253, 198, 244, 270, 373, 640, 136, -1, 279
     * @param param2 Unknown parameter. Possible values: 0, -1
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 241, 208, 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandBankRobbery(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 78 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 110, 115, 120, 125, 15055, 15056, 15057, 15058, 17250, 17260, 17270, 17280, 17450, 17460, 17470, 17480, 200, 1394, 2392, 3310, 1613, 4003, 6000, 3618, 10401, 10000, 11417, 2570, 22010, 23000, 7000, 8998, 16000, 17000, 17999, 19000, 21000, 3000, 5000
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Could be text reference. Possible values: 1002, 1020, 1035, 1052, 1054, 1245, 1281, 1282, 1283, 1215, 1235, 1263, 2002, 2031, 2049, 2085, 2003, 2032, 2050, 2086, 2106, 2132, 2146, 2162, 2107, 2477, 2147, 2163, 2001, 2201, 2273, 2326, 2350, 2351, 2352, 2353, 2400, 2401, 2402, 2403, 3001, 3016, 3028, 3040, 3055, 3080, 3096, 3114, 3119, 3148, 3159, 3176, 3004, 3190, 3203, 3216, 3225, 3663, 3673, 3584, 3597, 3604, 3612, 3620, 3631, 3640, 3656, 3564, 3574, 3548, 3549, 3550, 3683, 3693, 3712, 3713, 3714
     */
    private commandBrief(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 117 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Possible values: 205, 712, 760, 1582, 4222, 4252, 4031, 4091, 4152, 4227, 31022, 31082, 31162, 178, 15690, 3160, 3310, 3440, 3570, 1437, 1727, 1755, 1784, 1816, 1725, 5535, 2245, 2580, 2173, 2172, 2041, 2110, 2155, 5823, 6890, 20900, 350, 8081, 1260, 1672, 1700, 5006, 7250, 16410, 17280, 18090, 21980
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 171, 306
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandCancelBriefing(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 42 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 200, 152, 565, 373, 579, 640, 242, 225, 250, 950, 960, 970, 1272, 1280, 1290, 1300, 1610, 1730, 1740, 1750, 1760, 7175, 345, 346, 347, 408, 446, 459, 460, 5110, 5120, 9180, 11000, 11020, 11060, 11250, 11252, 11254, 11256, 11258, 11260, 13020
     * @param param2 Unknown parameter. Could be command line reference. Could be init line reference. Possible values: 0, 470, -1
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandCarOn(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 26 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 229, 230, 231, 232, 233, 234, 11900, 1950, 7600, 7620, 7640, 7660, 7680, 8460, 8493, 760, 762, 764, 766, 768, 846, 853
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandChangeBlock(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 970 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 299, 300, 301, 302, 249, 233, 382, 383, 384, 385, 386, 387, 388, 237, 268, 267, 152, 227, 228, 226, 238, 225, 295, 323, 324, 325, 326, 256, 250, 345, 346, 347, 351, 146, 147, 148, 336, 597, 595, 596, 598, 604, 605, 606, 607, 608, 609, 601, 602, 632, 633, 631, 3055, 121, 124, 127, 181, 131, 183, 184, 185, 186, 187, 188, 3750, 3760, 3770, 3780, 3272, 3274, 165, 3080, 3070, 158, 159, 3022, 3024, 3026, 3028, 168, 169, 170, 11865, 254, 139, 140, 141, 142, 143, 257, 258, 259, 260, 261, 262, 263, 264, 3300, 241, 240, 242, 246, 172, 11800, 11810, 370, 380, 390, 400, 410, 420, 425, 310, 320, 330, 340, 350, 741, 947, 980, 950, 990, 960, 1000, 970, 1005, 1210, 1230, 1250, 1270, 1274, 1350, 1360, 1370, 1470, 1410, 1686, 1810, 1990, 1890, 1900, 1910, 1920, 1930, 1940, 6160, 6170, 6180, 6190, 6200, 6210, 6220, 6230, 7100, 7110, 7120, 7130, 7140, 7150, 7160, 7170, 7400, 7410, 7420, 7430, 7440, 7450, 180, 213, 5100, 5200, 5300, 5400, 5900, 6000, 6100, 492, 285, 286, 287, 339, 341, 343, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 367, 368, 366, 23633, 376, 377, 378, 379, 423, 424, 432, 433, 434, 435, 436, 437, 438, 439, 440, 441, 442, 443, 430, 431, 454, 453, 455, 456, 451, 458, 452, 457, 447, 448, 449, 462, 467, 468, 469, 470, 471, 472, 465, 466, 476, 477, 478, 480, 481, 482, 670, 680, 690, 700, 710, 1090, 1100, 1110, 1120, 1130, 1140, 1150, 20301, 20302, 20303, 20304, 20305, 20306, 490, 500, 510, 520, 530, 540, 550, 560, 570, 580, 590, 600, 610, 620, 1020, 1080, 2060, 2070, 2080, 2090, 2180, 3000, 3020, 4000, 4010, 4020, 4030, 5000, 5010, 5020, 5030, 5040, 5050, 5060, 5070, 5080, 5090, 5130, 5140, 5150, 5160, 5170, 5180, 5182, 5184, 6030, 6040, 6050, 6060, 6070, 6080, 6090, 6110, 6120, 6130, 6140, 6150, 7090, 7040, 7050, 7060, 7080, 9010, 9020, 9030, 9040, 9050, 10000, 10020, 10050, 10080, 10110, 11030, 11070, 11090, 12050, 12060, 12070, 12280, 12282, 12000, 12030, 12010, 12020, 13160, 13140, 13150, 13170, 13180, 15193, 18170, 18180, 18190, 18200, 18210, 18220, 18230
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, -1, 616, 485, 5027, 1183, 824, 32300, 611, 3924, 4110, 4120, 10210, 10179, 1400, 1910, 1980
     * @param param3 Unknown parameter. Could be command line reference. Could be init line reference. Possible values: -1, 0, 1
     * @param param4 Unknown parameter. Possible values: 21, 22, 5, 24, 4, 7, 25, 8, 1, 0, 2, 26, 44, 6, 46, 10, 41, 23, 13, 12, 11, 45, 42
     * @param param5 Unknown parameter. Could be init line reference. Possible values: 294, 0, 255, 335, 597, 596, 605, 595, 604, 631, 632, -1, 120, 123, 126, 180, 85, 162, 168, 169, 3280, 140, 141, 142, 143, 240, 11810, 300, 310, 320, 330, 340, 350, 380, 390, 400, 410, 420, 425, 1200, 1220, 1240, 1260, 1410, 1830, 175, 209, 342, 445, 1050, 1030, 1000, 2000, 3020, 3000, 4040, 4050, 4070, 4060, 6040, 6030, 6070, 6060, 6100, 6090, 6130, 6120, 6160, 6150, 6050, 6080, 6110, 6140, 6170, 9180, 12000, 12010, 12020, 12050, 12060, 12070, 12030
     */
    private commandChangePedType(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 242 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 223, 224, 225, 226, 227, 228, 11910, 11920, 11930, 1960, 7700, 7720, 7740, 7760, 7780, 7800, 7820, 7840, 7860, 7880, 7900, 7920, 7940, 7960, 7980, 8480, 8492, 8490, 8494, 8495, 8496, 21000, 21001, 21002, 21003, 21004, 21005, 21006, 21007, 21008, 21009, 21010, 21011, 21012, 21013, 21014, 21015, 21016, 21017, 21018, 21019, 21020, 21021, 21022, 21023, 21024, 21025, 21026, 21027, 21028, 21029, 21030, 21031, 21032, 21033, 21034, 21035, 21036, 21037, 21038, 21039, 21040, 21041, 21042, 21043, 21044, 21045, 21046, 21047, 21048, 21049, 21050, 21051, 21052, 21053, 21054, 21056, 21057, 21058, 21059, 21060, 21061, 21062, 21063, 21064, 21065, 21066, 21067, 21068, 21069, 21070, 21071, 21072, 21073, 21074, 21075, 21076, 21077, 21078, 21079, 21080, 21081, 21082, 21083, 21084, 21085, 21086, 21087, 21088, 21089, 21090, 21091, 21092, 21093, 21094, 21095, 21096, 21097, 21098, 21099, 21100, 21101, 21102, 21103, 21104, 21105, 21106, 21107, 21108, 21109, 21110, 21111, 21112, 21113, 21114, 21115, 21116, 21117, 21118, 21119, 21120, 21121, 21122, 21123, 21124, 21125, 21126, 21127, 21128, 21129, 21130, 21131, 21132, 21133, 21134, 21135, 21136, 21137, 21138, 21139, 21140, 21141, 21142, 21143, 21144, 21145, 21146, 21147, 21148, 21149, 21150, 21151, 21152, 21153, 21154, 21155, 21156, 21157, 21158, 21159, 21160, 21161, 21162, 21163, 21164, 21165, 21166, 21167, 21168, 21169, 21170, 21171, 21172, 21173, 21174, 21175, 21176, 21177, 21178, 770, 772, 774, 776, 778, 780, 782, 784, 786, 788, 790, 792, 794, 796, 798, 848, 852, 850, 854, 855, 856
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 7880, -1, 777
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandChangeType(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 59 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 189, 253, 221, 230, 238, 295, 196, 198, 297, 256, 244, 485, 502, 374, 265, 209, 152, 612, 333, 315, 327, 251, 348, 270, 273, 219, 565, 373, 593, 213, 628, 640, 139, 116, 118, 3000, 3010, 1375, 1000
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 1056, 291, 1746, 1806
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 492, 455, 400, 928, 1497, 0, 2420, 2357, 2138, 2361, 2400, 2960, 3410, 3300, 3315, 3920, 4420, 4520, 4405, 5200, 6800, 950, 920, 900, 2660, 2665, 2655, 4400, 6500, 6560, 6400, 7960, 7800, 7940, 8850, 8540, 9860, 9800, 9820, 9840, 10800, 16950, 16500, 16530, 18700, 18750, 19990, 19735, 19845, 19850, 19840, 31305, -1, 5584, 1137
     * @param param4 Unknown parameter. Could be command line reference. Could be init line reference. Possible values: -1, 3, 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandCheckCar(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 31 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 191, 224, 151, 227, 616, 615, 320, 276, 272, 280, 566, 570, 599, 603, 117, 129, 249, 1310, 1630, 178, 248, 256, 282, 461, 1200, 14060
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 7400, 9650, 186, -1, 10315
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, 7400, -1, 9650
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandCloseDoor(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 331 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 548, 549, 550, 551, 574, 138, 575, 577, 578, 579, 580, 657, 658, 659, 660, 685, 367, 686, 689, 690, 691, 692, 9390, 3971, 3972, 3973, 3974, 9420, 9385, 3961, 3962, 3963, 3964, 1565, 1566, 1567, 5961, 5962, 5963, 5964, 5861, 5862, 5863, 5864, 23350, 992, 20722, 23635, 23636, 23634, 24150, 8552, 24160, 24161, 24162, 24163, 24110, 24111, 24112, 24113, 24120, 24121, 24122, 24123, 24130, 24131, 24132, 24133, 24140, 24141, 24142, 24143, 23600, 1190, 1200, 2200, 4224, 4220, 4221, 4222, 4223, 10210, 10250, 10220, 10260, 10230, 10270, 10240, 10280, 12270, 13200, 13210, 15194, 15195, 15196
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 18, 21, 24, -1, 63, 73, 83, 93, 410, 413, 416, 29000, 29200, 910, 913, 916, 1437, 1440, 1443, 29400, 29600, 1915, 1918, 1921, 2013, 2355, 2521, 2958, 3016, 3338, 3515, 3892, 4015, 4402, 5019, 5178, 6020, 6229, 6925, 6940, 6955, 8030, 0, 64, 113, 816, 2700, 2703, 2706, 4014, 4351, 5022, 6014, 6365, 7020, 7948, 8013, 8401, 9015, 9702, 10015, 10245, 16793, 16796, 16799, 17806, 17809, 17812, 18886, 18889, 18892, 19011, 19828, 20040, 20070, 20100, 31003, 1033, 15022, 15030, 15037, 15015, 25005, 25676, 25682, 25688, 25670, 6488, 6491, 6485, 27010, 27040, 27070, 29676, 29682, 29688, 29670, 32110, 4031, 27260, 27270, 27280, 27250, 27460, 27470, 27480, 27450, 27660, 27670, 27680, 27650, 27712, 27714, 27716, 27718, 28100, 27110, 1883, 1885, 1893, 1895, 1904, 1906, 20069, 20099, 20149, 20192, 25145, 25150, 27820
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, 482, 903, 1463, 1905, 8940, 29020, 29040, 29060, 29080, 29220, 29240, 29260, 29280, 29420, 29440, 29460, 29480, 29620, 29640, 29660, 29680, 2692, 5350, 16759, 17298, 18598, 15404, 28020, 451, 2545, 2557, -1, 5404, 5414, 27240, 27440, 27640, 28001, 32002, 3594, 3601, 3624, 7295, 7395, 7495, 7595, 20072, 20074, 20076, 20078, 20080, 20082, 20085, 20070, 20102, 20104, 20106, 20108, 20110, 20112, 20115, 20100, 20152, 20154, 20156, 20158, 20160, 20162, 20165, 20150, 20202, 20204, 20206, 20208, 20210, 20212, 20215, 20200, 23123, 23173, 23213, 23253, 23293, 25704, 25714, 27002, 27801, 27800
     * @param param4 Unknown parameter. Possible values: 1, 4, 0, 7, 6, 5, 3, 2
     * @param param5 Unknown parameter. Always 0
     */
    private commandCompare(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 24 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 285, 287, 289, 291, 92, 94, 96, 98, 200, 202, 204, 206
     * @param param2 Unknown parameter. Always -1
     * @param param3 Unknown parameter. Always -1
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 286, 288, 290, 292, 93, 95, 97, 99, 201, 203, 205, 207
     * @param param5 Unknown parameter. Always 0
     */
    private commandCrane(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 90 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 294, 85, 209
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 1716
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 6840, 9060, 9150, 9220, 9290, 9370, 9450, 10060, 10840, 12050, 12150, 12220, 12290, 12380, 12450, 13050, 16345, 17670, 17790, 5140, 1132, 1717, 2002, 2085, 930, 6610, 6635, 11013, 11113, 11242, 11342, 11414, 11514, 11614, 11714, 11814, 11914, 12012, 12112, 23740, 2450, 4875, 6270, 6862, 22770, 453, 900, 10190, 14000, 31563, 31603, 31643, 31683, 31723, 31803, 31843, 31923, 31963, 32223, 1710, 3590, 3597, 3620, 25701, 25711, 31763, 31883
     * @param param4 Unknown parameter. Possible values: -1, 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandDeadArrested(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 435 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 552, 574, 553, 368, 685, 369, 211, 3800, 3560, 3570, 285, 3990, 3991, 9420, 8000, 600, 8030, 8020, 1575, 1605, 9000, 23600, 23300, 992, 20722, 23634, 23635, 23636, 24150, 403, 8552, 638, 24160, 24161, 24162, 23350, 23330, 17000, 1190, 1200, 2200, 4224, 4220, 4200, 4221, 4222, 4223, 4210, 5190, 9230, 10210, 10250, 10220, 10260, 10230, 10270, 10240, 10280, 12270, 13200, 13210, 13240, 15196, 15194, 15195
     * @param param2 Unknown parameter. Possible values: 0, 11020, 11040, 11060, 11070, 11080, 11090, 3880, 11100, 11110, 11120, 11130, 810, 21040, 21020, 21050, 21060, 21070, 21080, 21090, 21100, 16742, 21000, 21010, 21030, 19823, 21110, 15380, 15000, 30000, 2500, 26000, 11401, 11501, 11601, 11701, 11801, 11901, 15011, 28000, 1920, 32000, 27000, 6630, 32700, 7510, 12410, 642, 782, 29942, 31042, 31142, 31553, 31593, 31633, 31673, 31713, 31793, 31833, 31913, 31953, 32213, 32390, 7640, 7830, 9690, 16927, 18930, 23910, 23920, 23820, 24280, 25670, 26410, 742, 31753, 31873, 32442, 32542, 32642
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, 11020, 11040, 11060, 11070, 11080, 11090, 3880, 11100, 11110, 11120, 11130, 810, 21040, 21020, 21050, 21060, 21070, 21080, 21090, 21100, 16742, 21000, 21010, 21030, 19823, 21110, -1, 20000, 15003, 11401, 11501, 11601, 11701, 11801, 11901, 27003, 29000, 6513, 6553, 6593, 642, 782, 29942, 31042, 31142, 31553, 31593, 31633, 31673, 31713, 31793, 31833, 31913, 31953, 32213, 9310, 16927, 18170, 18190, 18210, 18230, 18250, 24280, 25670, 26410, 742, 31753, 31873, 32442, 32542, 32642
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandDeccount(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 452 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 268, 227, 228, 256, 250, 597, 598, 596, 116, 118, 136, 135, 3055, 121, 120, 124, 123, 127, 126, 181, 180, 131, 183, 184, 185, 186, 187, 188, 190, 191, 192, 193, 3720, 3240, 205, 162, 163, 278, 165, 3100, 3022, 3024, 3026, 3028, 3000, 3010, 248, 247, 169, 212, 213, 140, 141, 142, 143, 139, 237, 238, 242, 246, 172, 200, 210, 215, 220, 225, 370, 741, 700, 710, 720, 730, 920, 947, 980, 950, 990, 960, 1000, 970, 1005, 1274, 1375, 1410, 1380, 1460, 1470, 1510, 1520, 1530, 1610, 1686, 1730, 1740, 1750, 1760, 1810, 2010, 6000, 6030, 6060, 6110, 7100, 7110, 7120, 7130, 7140, 7150, 7160, 7170, 7310, 7330, 7350, 7370, 7610, 175, 8020, 243, 244, 249, 251, 252, 279, 281, 492, 283, 483, 343, 339, 340, 341, 342, 345, 365, 366, 374, 376, 377, 378, 379, 395, 396, 397, 398, 408, 20912, 430, 425, 445, 475, 479, 462, 463, 464, 476, 477, 478, 480, 481, 482, 670, 680, 690, 740, 750, 760, 770, 780, 790, 800, 810, 650, 652, 1160, 1180, 1030, 1050, 23400, 802, 1020, 1080, 1090, 1100, 2000, 2060, 2070, 2080, 2090, 3020, 4000, 4010, 4020, 4030, 5000, 5010, 5020, 5030, 5040, 5050, 5060, 5070, 5080, 5090, 6040, 6050, 6070, 6080, 6100, 6130, 6140, 6160, 6170, 6090, 6120, 6150, 7040, 8000, 9000, 10000, 10020, 10050, 10080, 10110, 12000, 12010, 12020, 12030, 12050, 12060, 12070, 13000, 13010, 13020, 13030, 13040, 14040, 14050, 15010, 15030, 15050, 16030, 16050
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 584, 2970, 16440, 16484, 16540, 16600, 7010, 2070, -1, 2460, 6030, 6450, 21000, 10900, 11360, 11710, 12060, 12480, 13220, 13400, 13580, 13750, 13930, 14110, 14290, 14470, 14650, 14830, 22380, 22392, 22404, 22420, 22431, 22441
     * @param param3 Unknown parameter. Could be command line reference. Possible values: -1, 0, 2200
     * @param param4 Unknown parameter. Possible values: 0, 750
     * @param param5 Unknown parameter. Possible values: 0, 10000, 20000, 30000, 1000, 2001, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 25000, 50000, 40000
     */
    private commandDestroy(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 3037 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Possible values: 192, 203, 225, 255, 265, 275, 226, 231, 232, 236, 284, 576, 264, 239, 209, 153, 154, 159, 296, 210, 136, 197, 207, 202, 205, 298, 213, 257, 262, 269, 248, 242, 486, 487, 503, 505, 211, 212, 139, 214, 215, 216, 217, 218, 305, 273, 274, 497, 498, 499, 500, 501, 563, 564, 565, 566, 567, 568, 569, 570, 571, 572, 573, 194, 195, 375, 330, 149, 193, 201, 266, 151, 300, 150, 397, 402, 224, 376, 377, 378, 398, 611, 617, 613, 334, 399, 321, 344, 618, 619, 621, 322, 340, 252, 400, 249, 245, 349, 401, 281, 228, 372, 229, 393, 282, 283, 220, 222, 311, 362, 363, 364, 365, 366, 312, 341, 580, 583, 584, 585, 586, 594, 610, 592, 591, 331, 191, 626, 639, 638, 636, 230, 204, 143, 140, 247, 577, 575, 587, 622, 623, 634, 635, 396, 406, 407, 408, 409, 410, 411, 412, 674, 675, 676, 677, 678, 679, 680, 681, 682, 683, 684, 8, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 137, 138, 141, 142, 144, 145, 146, 147, 148, 21, 22, 23, 20, 152, 155, 156, 157, 158, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 196, 198, 199, 200, 206, 208, 219, 221, 223, 227, 233, 234, 235, 237, 238, 240, 241, 243, 244, 246, 25, 26, 27, 28, 29, 24, 3040, 3050, 3045, 3067, 271, 3790, 3730, 3270, 3350, 280, 3110, 3130, 11950, 3090, 9480, 9490, 9500, 9510, 253, 251, 3230, 11860, 3290, 3370, 3372, 10100, 10110, 10120, 10130, 270, 2510, 2540, 2560, 2590, 2620, 2640, 2660, 2680, 2700, 2720, 2740, 2760, 3540, 3550, 3580, 3590, 3600, 3610, 9440, 3030, 3995, 9700, 9710, 9720, 9730, 9740, 9750, 9760, 9770, 9780, 9790, 9250, 9260, 9270, 9280, 9290, 9300, 9310, 9320, 9330, 9340, 9350, 9360, 9370, 9380, 9600, 9610, 9620, 9630, 9640, 9650, 9660, 9670, 9680, 9690, 10000, 10010, 10030, 10050, 260, 360, 490, 705, 715, 725, 940, 932, 945, 1010, 1020, 1030, 1040, 1050, 1060, 1070, 1276, 1320, 1321, 1322, 1340, 1400, 1440, 1430, 1435, 1540, 1550, 1560, 1580, 1590, 1600, 1670, 1690, 1695, 1682, 1683, 1684, 1635, 1631, 1685, 1850, 1970, 2000, 2010, 2527, 3000, 3010, 3020, 3060, 3070, 5840, 5850, 5940, 5950, 7320, 7340, 7360, 7380, 7620, 747, 1080, 1090, 1100, 1680, 1770, 1780, 1790, 1800, 1820, 2040, 9550, 9560, 10, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 1021, 1031, 1032, 1033, 1034, 1035, 1037, 1038, 1039, 1051, 1052, 1053, 1054, 1055, 1056, 1057, 1058, 1059, 1061, 1062, 1063, 1064, 1065, 1066, 1067, 1068, 1069, 1071, 1072, 1073, 1074, 1075, 1076, 1077, 1078, 1079, 1081, 1082, 1083, 1084, 10001, 10002, 10003, 10004, 10005, 10006, 10007, 10008, 10009, 10011, 10012, 10013, 10014, 10015, 10016, 10017, 10018, 10019, 10020, 10021, 10022, 10023, 10024, 10025, 10031, 10032, 10033, 10034, 10035, 10036, 10037, 10038, 10039, 10040, 10041, 10051, 10052, 10053, 10054, 10055, 10056, 10057, 10058, 10059, 10060, 10061, 10062, 10063, 10064, 10065, 10066, 10067, 10068, 10069, 10070, 10071, 10072, 10073, 10074, 10075, 10076, 10077, 10078, 10079, 10080, 10081, 10082, 10084, 30, 23610, 20630, 20640, 20920, 6400, 6600, 6800, 7300, 7100, 8400, 276, 960, 277, 278, 292, 293, 294, 290, 640, 485, 23621, 291, 23620, 302, 304, 306, 308, 310, 314, 20700, 20710, 348, 20720, 373, 369, 371, 370, 23631, 23632, 380, 389, 495, 404, 405, 493, 20915, 20900, 20910, 20914, 20913, 494, 22000, 22010, 20650, 20660, 20670, 20680, 23208, 450, 8510, 8520, 8530, 8540, 662, 660, 663, 1170, 20307, 20308, 23520, 23521, 23522, 23523, 23524, 23525, 23526, 23527, 23528, 23529, 23530, 23531, 23532, 24010, 24020, 24030, 600, 612, 614, 18750, 18710, 18730, 20800, 20810, 20820, 20830, 20840, 20850, 20860, 20870, 20880, 20890, 21180, 21181, 21182, 23630, 630, 650, 670, 720, 710, 840, 1140, 1150, 2050, 2172, 2170, 2190, 2210, 3080, 4160, 4170, 4180, 4190, 4212, 4120, 4214, 4130, 4216, 4140, 4218, 4150, 5100, 6180, 7010, 7020, 7030, 7180, 8030, 8010, 8020, 8040, 9190, 9200, 9210, 9240, 9241, 9242, 9243, 9244, 9245, 10170, 10180, 10190, 10200, 11300, 11210, 11230, 11240, 12190, 12200, 12260, 12210, 12220, 13130, 13050, 13060, 13070, 13080, 14000, 14030, 14020, 15000, 15040, 15180, 15190, 15090, 15020, 15191, 15192, 16000, 16010, 16020, 16040, 16060, 16070, 16080, 23400, 250, 18290, 18310, 18330, 18450, 18470, 18490, 18510, 18530, 18550, 18570, 18590, 18610, 18630, 18231, 18232, 1036, 10083
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 100, 505, 1000, 1500, -1, 16000, 17000, 2000, 18000, 140, 2600, 4000, 8000, 16080, 647, 508, 2745, 1001, 11030, 11130, 11447, 11547, 11647, 11747, 11847, 11947, 12030, 12130, 15043, 15044, 15045, 15046, 28600, 6712, 10000, 10700, 10600, 10400, 10500, 10100, 10300, 10200, 26270, 33600, 503, 2649, 2584, 3782, 4197, 4054, 8404, 9270, 10577, 14996, 32747, 464, 1400, 1780, 32300, 5004, 18455, 18518, 24070, 31394
     * @param param3 Unknown parameter. Could be command line reference. Possible values: -1, 100, 505, 1000, 1500, 0, 16000, 17000, 2000, 18000
     * @param param4 Unknown parameter. Possible values: 0, -1
     * @param param5 Unknown parameter. Possible values: 0, -1, 1000, 4000, 6000, 10000, 25000, 5000
     */
    private commandDisable(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 3 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandDisarmmess(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 3 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 270, 263, 202
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Possible values: 20000, 0
     */
    private commandDoGta(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 12 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 17120, 11220, 11320, 23100, 29944, 31044, 31144, 32444, 32544, 32644
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 17265, -1, 0
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, 11244, 11344, 29994, 31094, 31194, 32494, 32594, 32694
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 579, -1
     * @param param5 Unknown parameter. Could be command line reference. Possible values: 2000, 0
     */
    private commandDoModel(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 189, 253
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Possible values: 200, 400
     * @param param5 Unknown parameter. Possible values: 15000, 20000
     */
    private commandDoRepo(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 62 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandDonowt(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 54 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 191, 224, 227, 177, 267, 616, 254, 272, 276, 566, 599, 603, 630, 117, 119, 206, 207, 214, 215, 7300, 394, 248, 253, 255, 256, 282, 461, 473, 474, 1200, 23102, 23103, 14060, 15060, 23101, 23104, 23105, 23106, 23107, 23108, 23109, 23110, 23111, 23112
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 2635, 196, -1, 10292
     * @param param3 Unknown parameter. Could be text reference. Could be command line reference. Possible values: 0, 2635, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandDoorOff(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 101 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 191, 254, 224, 151, 229, 201, 245, 175, 177, 179, 181, 183, 185, 187, 227, 192, 267, 570, 616, 615, 318, 320, 272, 276, 566, 568, 599, 603, 630, 637, 154, 155, 156, 157, 158, 159, 421, 422, 423, 424, 141, 101, 103, 105, 107, 109, 111, 113, 129, 9450, 9460, 206, 207, 209, 214, 215, 9405, 9410, 3400, 3410, 3420, 3430, 3440, 3450, 3460, 7800, 7810, 7820, 7830, 7840, 7850, 7860, 2512, 2513, 2514, 2515, 6240, 7300
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 32000, 20008
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, 32000, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandDoorOn(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 3 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 240, 198, 241
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandDropOn(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 114 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, -1, 201, 289, 381, 32320, 32321, 32322, 32323, 32324, 32325, 32326, 32327, 32328, 32329, 32330, 32331, 32332, 32333, 32334, 32335, 32336
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Possible values: 0, -1
     * @param param5 Unknown parameter. Always 0
     */
    private commandDropWantedLevel(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 14 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 120, 123, 126, 180, 162, 3280, 1200, 1220, 1240, 1260, 1410, 175, 340, 342
     * @param param2 Unknown parameter. Possible values: 0, -1
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandDummyDriveOn(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 55 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 200, 215, 319, 277, 373, 579, 593, 242, 136, 131, 3720, 212, 238, 225, 250, 920, 950, 960, 970, 1272, 1380, 1610, 1730, 1740, 1750, 1760, 7392, 7393, 7394, 7395, 175, 251, 252, 483, 350, 351, 365, 1000, 1160, 2000, 7000, 11250, 11252, 11254, 11256, 11258, 11260, 13000, 13010, 13030, 13040, 14010, 15010
     * @param param2 Unknown parameter. Possible values: 0, -1
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandDummyon(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 3432 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 192, 225, 255, 265, 275, 226, 231, 232, 236, 284, 576, 264, 153, 154, 159, 239, 136, 296, 202, 205, 197, 298, 262, 269, 248, 242, 257, 487, 486, 505, 503, 305, 273, 274, 497, 498, 499, 500, 501, 203, 563, 564, 565, 566, 567, 568, 569, 570, 571, 572, 573, 149, 193, 201, 375, 266, 151, 300, 150, 194, 195, 402, 611, 617, 613, 210, 340, 321, 344, 618, 619, 621, 322, 334, 249, 245, 252, 281, 228, 372, 282, 283, 393, 229, 349, 222, 220, 311, 362, 363, 364, 365, 366, 312, 341, 580, 587, 594, 610, 592, 591, 191, 626, 639, 638, 636, 214, 140, 143, 674, 675, 676, 677, 678, 679, 680, 681, 682, 683, 684, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 137, 138, 139, 141, 142, 144, 145, 146, 147, 148, 21, 22, 23, 152, 155, 156, 157, 158, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 196, 198, 199, 200, 204, 206, 207, 208, 209, 211, 212, 213, 215, 216, 217, 218, 219, 221, 223, 224, 227, 230, 233, 234, 235, 237, 238, 240, 241, 243, 244, 246, 247, 25, 26, 27, 28, 29, 3040, 3050, 3045, 3067, 271, 3790, 3730, 3270, 3350, 280, 3090, 3110, 3130, 9480, 9490, 9500, 9510, 253, 251, 3230, 11860, 3290, 3370, 3372, 10100, 10110, 10120, 10130, 270, 2620, 2640, 2660, 2680, 2700, 2720, 3540, 3550, 3580, 3590, 3600, 3610, 3995, 9250, 9260, 9270, 9280, 9290, 9300, 9310, 9320, 9330, 9340, 9350, 9360, 9370, 9380, 9700, 9710, 9720, 9730, 9740, 9750, 9760, 9770, 9780, 9790, 10000, 10010, 10030, 10050, 260, 360, 490, 705, 715, 725, 945, 940, 932, 930, 1010, 1020, 1030, 1040, 1050, 1060, 1070, 1276, 1320, 1321, 1322, 1340, 1435, 1430, 1400, 1440, 1540, 1550, 1560, 1580, 1590, 1600, 1631, 1670, 1690, 1685, 1695, 1682, 1683, 1684, 1635, 1970, 2000, 2010, 2527, 3000, 3010, 3020, 3030, 3060, 3070, 6240, 7320, 7340, 7360, 7380, 7620, 5940, 5950, 9450, 5840, 5850, 9550, 9560, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 1021, 1031, 1032, 1033, 1034, 1035, 1037, 1038, 1039, 1051, 1052, 1053, 1054, 1055, 1056, 1057, 1058, 1059, 1061, 1062, 1063, 1064, 1065, 1066, 1067, 1068, 1069, 1071, 1072, 1073, 1074, 1075, 1076, 1077, 1078, 1079, 1080, 1081, 1082, 1083, 1084, 10001, 10002, 10003, 10004, 10005, 10006, 10007, 10008, 10009, 10011, 10012, 10013, 10014, 10015, 10016, 10017, 10018, 10019, 10020, 10021, 10022, 10023, 10024, 10025, 10031, 10032, 10033, 10034, 10035, 10036, 10037, 10038, 10039, 10040, 10041, 10051, 10052, 10053, 10054, 10055, 10056, 10057, 10058, 10059, 10060, 10061, 10062, 10063, 10064, 10065, 10066, 10067, 10068, 10069, 10070, 10071, 10072, 10073, 10074, 10075, 10076, 10077, 10078, 10079, 10080, 10081, 10082, 10084, 24010, 24020, 24030, 23610, 20630, 20920, 20640, 394, 276, 277, 278, 292, 254, 293, 294, 256, 640, 23620, 485, 23621, 290, 291, 20700, 20710, 20720, 348, 371, 369, 373, 23631, 23632, 370, 389, 380, 495, 399, 404, 400, 405, 401, 406, 407, 493, 20900, 20910, 409, 20914, 20915, 20913, 494, 20650, 20660, 20670, 20680, 22000, 22010, 450, 23208, 461, 8520, 8530, 8540, 8510, 473, 474, 662, 660, 663, 1170, 1200, 20307, 20308, 23520, 23521, 23522, 23523, 23524, 23525, 23526, 23527, 23528, 23529, 23530, 23531, 23532, 600, 612, 614, 20800, 20810, 20820, 20830, 20840, 20850, 20860, 20870, 20880, 20890, 21181, 21182, 21180, 1140, 1150, 2040, 2210, 2170, 2190, 2050, 2172, 3080, 4160, 4170, 4180, 4190, 4212, 4214, 4216, 4218, 4120, 4130, 4140, 4150, 5100, 6180, 7010, 7020, 7030, 7180, 8030, 8010, 8020, 8040, 9190, 9240, 9241, 9242, 9200, 9243, 9244, 9245, 9210, 10170, 10180, 10190, 10200, 11300, 11230, 11210, 11240, 12220, 12190, 12260, 12200, 12210, 13130, 13050, 13060, 13070, 13080, 14000, 14020, 14030, 14060, 15020, 15191, 15192, 15040, 15060, 15180, 15190, 15090, 16010, 16020, 16040, 16060, 16080, 16070, 23400, 250, 15000, 16000, 18231, 18232, 1036, 10083
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, -1, 545, 8000, 476, 898, 1458, 1899, 2351, 2947, 3334, 3882, 4398, 5171, 6225, 16750, 17287, 2687, 18590, 812, 4347, 6361, 7943, 8397, 9698, 10241, 19824, 152, 234, 570, 5130, 1703, 35000, 28700, 25005, 15002, 6479, 6484, 6751, 6773, 33700, 29655, 27002, 4051, 4023, 5072, 32300
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, -1, 545, 8000, 476, 898, 1458, 1899, 2351, 2947, 3334, 3882, 4398, 5171, 6225, 16750, 17287, 2687, 18590, 812, 4347, 6361, 7943, 8397, 9698, 10241, 19824
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Could be command line reference. Possible values: 0, 10000
     */
    private commandEnable(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 7 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Possible values: 1, 2
     * @param param2 Unknown parameter. Possible values: 0, -1
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Possible values: 1, 0
     * @param param5 Unknown parameter. Possible values: 50000, 0
     */
    private commandEnd(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 23 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 156, 157, 154, 155, 152, 153, 218, 268, 219, 220, 221, 222, 1620, 1621, 1622, 1623, 1624, 1625, 1626, 1640, 1645, 1650, 1655
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 6713
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Possible values: 1, 3, 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandExplNoFire(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 12 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 85, 3810, 2010, 8010, 8550, 7190, 7200
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 1719, 0, -1
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandExplPed(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 45 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 129, 343, 312, 314, 344, 346, 318, 349, 351, 359, 320, 329, 354, 358, 362, 375, 377, 133, 130, 131, 268, 264, 128, 328, 571, 243, 244, 2050, 2060, 2070, 2080, 2090, 2100, 2110, 2120, 2130, 2140, 2150
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 810, 0, 4290, 4300, 7540, 31270
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, -1, 7540
     * @param param4 Unknown parameter. Possible values: 0, 3, 2, 1
     * @param param5 Unknown parameter. Possible values: 0, 5000, 50000, 30000
     */
    private commandExplode(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 21 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 265, 612, 190, 191, 192, 193, 162, 148, 149, 150, 151, 700, 710, 720, 730, 1000, 8000, 14010
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, -1, 2460, 32300, 24212
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Possible values: 0, 20000
     */
    private commandExplodeCar(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 319, 277
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Always -1
     * @param param5 Unknown parameter. Always 0
     */
    private commandFreeupCar(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 7 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandFreezeEnter(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 7 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 25, 200, 100, 30
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandFreezeTimed(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 140 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 11003, 11103, 12003, 12103, 32250, -1, 32251, 32252, 32253, 32254
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Possible values: 16, 24, 0
     * @param param5 Unknown parameter. Possible values: 1426, 1425, 2510, 2511, 2512, 2513, 2507, 3501, 3754, 3401, 3504, 3755, 3506, 3758, 3508, 3756, 3510, 3757, 3512, 3759, 3514, 3760, 3516, 3761, 3518, 3762, 3522, 3763, 3524, 3764, 3528, 3765, 3530, 3766, 3532, 3767, 3534, 3768, 3449, 3503, 3505, 3513, 3515, 3517, 3519, 3520, 3521, 3523, 3525, 3526, 3527, 3529, 3531, 3533, 3535, 3536, 3509, 3507, 3511
     */
    private commandFrenzyBrief(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 70 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Possible values: 1000, 3000, 5000, 10000, 15000, 25000, 9000, 30000, 150000, 35000, 50000, 70000, 90000, 210000
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 11020, 11120, 11270, 11370, 11430, 11530, 11630, 11730, 11830, 11930, 12020, 12120, 654, 794, 29959, 31059, 31159, 31568, 31608, 31648, 31688, 31728, 31808, 31848, 31928, 31968, 32228, 754, 31768, 31888, 32459, 32559, 32659
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 9030, 9110, 9190, 9270, 9350, 9430, 10030, 12030, 12110, 12190, 12270, 12350, 12430, 13030, 11006, 11106, 11240, 11340, 11412, 11512, 11612, 11712, 11812, 11912, 12006, 12106, 645, 785, 29948, 31048, 31148, 31557, 31597, 31637, 31677, 31717, 31797, 31837, 31917, 31957, 32217, 745, 31757, 31877, 32448, 32548, 32648
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Possible values: 20000, 30000, 0
     */
    private commandFrenzyCheck(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 70 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 9030, 9110, 9190, 9270, 9350, 9430, 10030, 12030, 12110, 12190, 12270, 12350, 12430, 13030, 11006, 11106, 11240, 11340, 11412, 11512, 11612, 11712, 11812, 11912, 12006, 12106, 645, 785, 29948, 31048, 31148, 31557, 31597, 31637, 31677, 31717, 31797, 31837, 31917, 31957, 32217, 745, 31757, 31877, 32448, 32548, 32648
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Possible values: 0, -1
     * @param param5 Unknown parameter. Always 0
     */
    private commandFrenzySet(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 247 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 137, 252, 299, 300, 301, 302, 249, 237, 382, 383, 38, 16, 145, 622, 345, 346, 347, 350, 351, 352, 146, 147, 148, 335, 336, 3022, 3024, 3026, 3028, 139, 240, 3821, 3820, 741, 1435, 1380, 1570, 1610, 7100, 7110, 7120, 7130, 7140, 7150, 7160, 7170, 7410, 7871, 7870, 5100, 5200, 5300, 5400, 5900, 6000, 6100, 6200, 492, 285, 286, 287, 423, 424, 430, 447, 448, 449, 451, 452, 453, 454, 455, 456, 457, 458, 1000, 20301, 20302, 20303, 20304, 20305, 20306, 4, 0, 67, 470, 480, 490, 500, 510, 520, 530, 540, 550, 560, 570, 580, 590, 600, 610, 620, 1020, 2000, 3000, 4000, 4010, 4020, 4030, 5130, 5140, 5150, 5160, 5170, 5180, 5182, 5184, 6040, 6050, 6070, 6080, 6110, 6130, 6140, 6160, 6170, 7000, 7050, 7060, 7080, 7090, 10020, 10050, 10080, 10110, 11251, 11253, 11255, 11257, 11259, 11261, 13000, 13010, 13020, 13030, 13040, 18170, 18180, 18190, 18200, 18210, 18220, 18230
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 502, 670, 673, 676, 679, 826, 1280, 1403, 1406, 1409, 4530, 4540, 4550, 8404, 8408, 8412, 8416, 8420, 8424, 9426, 9429, 9432, 16123, 16138, 5824, 902, 906, 910, 914, 922, 926, 930, 934, 2603, 2725, 2731, 2737, 8413, 8423, 10323, 10328, 10333, 10338, 10343, 10348, 10353, 10358, 10363, 10368, 10373, 10388, 10393, 10398, 13723, 15014, 15019, 15024, 15029, 15034, 15039, 942, 946, 950, 954, 962, 966, 970, 974, 5520, 5563, 7288, 7332, 7388, 7432, 7488, 7532, 7588, 7632, 9743, 9748, 9753, 9758, 9763, 9768, 9773, 9778, 15164, 15174, 15184, 15194, 15204, 15214, 15224, 15234, 15244, 15254, 16943, 16948, 16953, 16958, 16963, 16968, 16973, 16978, 16983, 16988, 16993, 16998, 21988, 21991, 21994, 21997, 22000, 22003, 23380, 23480, 23580, 23680, 31414, 31419, 31424, 31429, 31434, 31439, 31444
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 14, 406, 0, 906, 1485, 1433, 1911, 6901, 13, 2696, 7520, 16789, 17802, 18882, 20002, 1980, 1982, 1984, 1986, 820, 6225, 6390, 15012, 25010, 2180, 5860, 6482, 6782, 20030, 20130, 20230, 20330, 20430, 20530, 20630, 20730, 22550, 27008, 29657, 2721, 2720, 2727, 2726, 2733, 2732, -1, 9400, 27241, 27441, 27641, 1143, 3570, 7283, 7383, 7483, 7583, 9744, 9749, 9754, 9759, 9764, 9769, 9774, 9779, 15165, 15175, 15185, 15195, 15205, 15215, 15225, 15235, 15245, 15255, 16202, 16944, 16949, 16954, 16959, 16964, 16969, 16974, 16979, 16984, 16989, 16994, 16999, 19227, 19417, 19617, 19807, 23100, 23140, 23180, 23220, 23260
     * @param param4 Unknown parameter. Possible values: 0, -1
     * @param param5 Unknown parameter. Could be command line reference. Possible values: 0, 10000, 1000
     */
    private commandGeneralOnscreen(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 9 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 85, 209
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 5015, 1023, 0, 24081
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 3240, 3100, 248, 7310, 7330, 7350, 7370, 20912, 14050
     * @param param5 Unknown parameter. Always 0
     */
    private commandGetCarInfo(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 40 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 319, 277, 579, 136, 131, 212, 3280, 238, 242, 920, 950, 960, 970, 1272, 1280, 1290, 1300, 1380, 1410, 1610, 175, 240, 241, 483, 365, 1000, 2000, 13020, 13000, 13010, 13030, 13040, 15010
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 5505
     * @param param3 Unknown parameter. Possible values: 0, 614, 579, 5905, 874, 6282, 6460, 3132, 3940, 4020, 4130, 4830, 5593, 5594, 5595, 5870, 6210, 6843, 243, 281, 1424, 1429, 2584, 2651, 4082, 4095, 13090, 13724, 3540, 3583, 3615, 23310, 23380, 23480, 23580, 23680, 25682, 25692
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 622, 395, 687, 3055, 131, 11865, 3300, 238, 242, 947, 950, 960, 970, 1274, 1350, 1360, 1370, 1460, 1410, 1686, 180, 240, 241, 492, 23633, 1160, 1180, 2180, 13160, 13140, 13150, 13170, 13180, 15193
     * @param param5 Unknown parameter. Always 0
     */
    private commandGetDriverInfo(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 33 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 119, 129, 200, 201, 202, 203, 209, 246, 173, 10010, 10000, 10040, 10060, 1465, 6240, 178, 394, 248, 253, 254, 255, 256, 282, 461, 473, 474, 1200, 14060, 15060
     * @param param2 Unknown parameter. Could be command line reference. Possible values: -1, 0, 5070, 5824
     * @param param3 Unknown parameter. Could be command line reference. Possible values: -1, 3220, 3221, 3222, 3223, 0, 2490, 29041, 29091, 29160, 29260, 5851, 36041, 36091, 36160, 36260
     * @param param4 Unknown parameter. Possible values: 0, 1500, 2250, 3000, 100, 50
     * @param param5 Unknown parameter. Could be init line reference. Possible values: 0, 64
     */
    private commandGoto(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 3 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 240, 198, 241
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 810, 4300, 31270
     * @param param4 Unknown parameter. Always 56
     * @param param5 Unknown parameter. Possible values: 50000, 0, 40000
     */
    private commandGotoDropoff(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 9 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 221, 222, 223, 316, 317, 240, 241, 242, 243
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandHellOn(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 3 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Possible values: 350, 351, 14010
     * @param param2 Unknown parameter. Possible values: 0, -1
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandHuntoff(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 3 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Possible values: 350, 351, 14010
     * @param param2 Unknown parameter. Possible values: 0, -1
     * @param param3 Unknown parameter. Always 1
     * @param param4 Unknown parameter. Always 209
     * @param param5 Unknown parameter. Always 0
     */
    private commandHunton(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 22 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Possible values: 2, 1, 4
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 1622, 2690
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, 1622
     * @param param4 Unknown parameter. Possible values: -1, 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandIncHeads(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 150 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 574, 548, 549, 550, 551, 138, 575, 577, 578, 579, 580, 685, 657, 658, 659, 660, 367, 686, 689, 690, 691, 692, 3961, 3962, 3963, 3964, 9420, 9390, 3971, 3972, 3973, 3974, 9385, 1565, 1566, 1567, 5861, 5862, 5863, 5864, 5961, 5962, 5963, 5964, 23600, 24110, 24111, 24120, 24112, 24133, 24113, 24123, 24121, 24122, 24143, 24141, 24140, 24131, 24130, 24132, 24142
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, -1, 1033, 15060, 15064, 15068, 15072, 25005, 1663, 1614, 4106, 4004, 7070, 7005, 8034, 8003
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Could be command line reference. Could be init line reference. Possible values: 0, 1, -1
     * @param param5 Unknown parameter. Always 0
     */
    private commandInccount(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 925 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Possible values: 189, 294, 252, 253, 299, 300, 301, 302, 249, 221, 233, 237, 384, 385, 386, 387, 388, 383, 382, 230, 267, 268, 150, 152, 238, 228, 227, 198, 199, 297, 244, 485, 304, 256, 295, 226, 225, 265, 332, 612, 622, 319, 323, 324, 325, 326, 315, 327, 345, 346, 347, 350, 351, 352, 250, 255, 146, 147, 148, 395, 277, 270, 271, 273, 335, 336, 373, 565, 339, 578, 687, 598, 595, 596, 593, 600, 628, 640, 632, 196, 251, 209, 213, 139, 3810, 183, 184, 185, 186, 187, 188, 85, 3750, 3760, 3770, 3780, 3070, 3080, 3022, 3024, 3026, 3028, 240, 11810, 11800, 200, 205, 210, 215, 220, 8010, 370, 380, 390, 400, 410, 420, 425, 310, 320, 330, 340, 1200, 1210, 1220, 1230, 1240, 1250, 1260, 1270, 1350, 1360, 1370, 1302, 1303, 1304, 1305, 1306, 1307, 1308, 1309, 6110, 6160, 6170, 6180, 6190, 6200, 6210, 6220, 6230, 6120, 6130, 6140, 6150, 7400, 7410, 7420, 7430, 7440, 7450, 180, 5400, 5300, 5200, 5100, 6100, 6000, 5900, 3000, 8020, 241, 285, 286, 287, 341, 343, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 376, 377, 378, 379, 423, 424, 430, 447, 448, 449, 451, 452, 453, 454, 455, 456, 457, 458, 462, 8550, 465, 466, 467, 468, 469, 470, 471, 472, 476, 477, 478, 480, 481, 482, 670, 680, 690, 700, 710, 20301, 20302, 20303, 20304, 20305, 20306, 18740, 18700, 18720, 23400, 500, 490, 540, 530, 520, 510, 580, 570, 560, 550, 620, 610, 590, 802, 2060, 2070, 2080, 2090, 3020, 4000, 4050, 4070, 4060, 4010, 4040, 4020, 4030, 5000, 5010, 5020, 5030, 5040, 5050, 5060, 5070, 5080, 5090, 5130, 5140, 5150, 5160, 5170, 5180, 5182, 5184, 6040, 6050, 6070, 6080, 6030, 6060, 6090, 7040, 7050, 7060, 7080, 7090, 7100, 7110, 7120, 7130, 7140, 7150, 7160, 7170, 9010, 9020, 9030, 9040, 9050, 11000, 11070, 11020, 11030, 11060, 11090, 12000, 12030, 12010, 12020, 12050, 12060, 12070, 12040, 13000, 13010, 13020, 13030, 13040, 18170, 18180, 18190, 18200, 18210, 18220, 18230
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 502, 670, 673, 676, 679, 826, 530, 1480, 1280, 1303, 1305, 1308, 1311, 1314, 1335, 1403, 1406, 1409, -1, 1714, 1745, 2590, 2930, 6860, 8927, 257, 947, 2940, 7951, 8404, 8408, 8412, 8416, 8420, 8424, 8730, 8830, 9426, 9429, 9432, 16123, 16138, 16994, 18154, 18163, 18170, 220, 299, 667, 388, 586, 2770, 2810, 2850, 2970, 2976, 3652, 17738, 17756, 17762, 17766, 17525, 5110, 1530, 1215, 1991, 1994, 1997, 1999, 1931, 7050, 2079, 5888, 920, 6550, 2520, 29041, 29091, 29160, 29260, 560, 600, 640, 680, 800, 840, 925, 700, 1125, 1565, 2235, 3280, 3900, 4750, 4930, 5752, 6345, 6640, 6765, 6980, 7020, 7090, 7101, 19030, 19320, 19330, 19340, 19350, 19360, 19370, 19380, 19390, 19470, 19480, 19490, 19430, 19545, 21020, 22280, 22720, 22750, 23410, 36041, 36091, 36160, 36260, 516, 522, 572, 578, 906, 910, 914, 922, 926, 930, 934, 1428, 1440, 11545, 11555, 11565, 11575, 11590, 11605, 11615, 11625, 11635, 11641, 11680, 11720, 11760, 11800, 11848, 12606, 12608, 12610, 12612, 12614, 12636, 12638, 12640, 12642, 12644, 488, 494, 544, 550, 942, 946, 950, 954, 962, 966, 970, 974, 3510, 3524, 3526, 3528, 3530, 32300, 7297, 7299, 7397, 7399, 7497, 7499, 7597, 7599, 9320, 9360, 9400, 9440, 9480, 9520, 9560, 9600, 9640, 9680, 15383, 15386, 15389, 15392, 15395, 15398, 15401, 15404, 15407, 15490, 15590, 15620, 15650, 15680, 15690, 16402, 16510, 16550, 16570, 16590, 16610, 16630, 16650, 16670, 16690, 16710, 16730, 18190, 18210, 18230, 18250, 18352, 18354, 18356, 18358, 18494, 18545, 21250, 21279, 21370, 21430, 21610, 21790, 22383, 22386, 22389, 22380, 22395, 22398, 22401, 22392, 22407, 22410, 22413, 22404, 22423, 22426, 22420, 22434, 22437, 22431, 22444, 22447, 22441, 22476, 22480, 22484, 22516, 22518
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 150, 250, 484, 494, 0, 930, 950, 970, 980, 1296, 1301, 1304, 1307, 1310, 1313, 1316, 1380, 1410, 1465, 1471, 1491, 1720, 2370, 2380, 2430, 2450, 2470, 3350, 3420, 3440, 3460, 3900, 4430, 5250, 8925, 28005, 28205, 28405, 28605, 29016, 29036, 29056, 29076, 29216, 29236, 29256, 29276, 29416, 29436, 29456, 29476, 29616, 29636, 29656, 29676, 941, 960, 2710, 2800, 6520, 6530, 6650, 7350, 7900, 7962, 7970, 7980, 8860, 8890, 9260, 9620, 9640, 9890, 9915, 9940, 9970, 10860, 16550, 16802, 16930, 16965, 16990, 17400, 17500, 17900, 18770, 18800, 18830, 19710, 19750, 19775, 19785, 19940, 19980, 31320, 217, 15622, 16031, 496, 521, 3006, 3010, 3672, 17730, 17732, 17734, 17736, 17770, 17771, 17772, 17773, 17800, 17804, 17808, 17812, 17523, 5116, 1553, 1218, 1270, 1272, 1990, 1993, 1996, 1999, 1946, 7056, 2082, 5891, 926, 6405, 6561, 2526, 23560, 23620, 23672, 23680, 23860, 946, 990, 1110, 1305, 1309, 1311, 1315, 1591, 1740, 1770, 1800, 1830, 1860, 1890, 1950, 2251, 3175, 3301, 3906, 4250, 4710, 4715, 4720, 4725, 4730, 4735, 4740, 4745, 4966, 5535, 5710, 5715, 5720, 5725, 5730, 5731, 5732, 5733, 5734, 5735, 5736, 5761, 6361, 6656, 6780, 7121, 18070, 18240, 18470, 19020, 19200, 19000, 19222, 19312, 19322, 19332, 19342, 19352, 19362, 19372, 19382, 19450, 19462, 19472, 19482, 19492, 19566, 20800, 21051, 22311, 22485, 22490, 22500, 22510, 22520, 22530, 22766, 23441, 457, 510, 515, 520, 564, 570, 576, 650, 790, 940, 942, 943, 944, 945, 947, 1460, 2507, 3580, 3901, 3902, 3903, 3904, 3905, 3907, 3908, 3909, 3937, 3941, 3962, 5410, 9503, 9510, 9550, 10375, 10376, 10377, 10378, 10379, 10380, 10381, 10382, 10488, 10610, 10611, 10612, 10613, 10614, 10615, 10616, 10617, 11312, 11642, 11643, 11644, 11645, 11646, 12500, 12525, 12545, 15004, 29953, 31053, 31153, 480, 486, 492, 508, 514, 536, 542, 548, 750, 981, 982, 983, 984, 985, 986, 987, 988, 989, 991, 992, 993, 994, 995, 3511, 4010, 4110, 4210, 4310, 7890, 7903, 7910, 7913, 7920, 7923, 9111, 9291, 9292, 9293, 9294, 9295, 9296, 9297, 9298, 9299, 9300, 9798, 9812, 9912, 10391, 10392, 10393, 10394, 10395, 10396, 10397, 10398, 10399, 10400, 15010, 15030, 15040, 15050, 15052, 15382, 15385, 15388, 15391, 15394, 15397, 15400, 15403, 15406, 15409, 15796, 15820, 15920, 16390, 16402, 16798, 16804, 16904, 18160, 18180, 18200, 18220, 18468, 18490, 18492, 18524, 18550, 18560, 18562, 18631, 18632, 18633, 18634, 18635, 18697, 18718, 18818, 21235, 21277, 21350, 21410, 21590, 21770, 21800, 21801, 21802, 21803, 21804, 21805, 22190, 22191, 22196, 22197, 22370, 22371, 22372, 22373, 22450, 22452, 22454, 22470, 22492, 22494, 22496, 22513, 22698, 22703, 22803, 23720, 23730, 23740, 23750, 23760, 23898, 23907, 23957, 31403, 32453, 32553, 32653
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 0, -1, 85, 11800
     * @param param5 Unknown parameter. Possible values: 0, 50000, 30000, 40000, 1000
     */
    private commandIsGoalDead(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 27 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 294, 85, 209
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 235, 1360, 3340, 5260, 2730, 6505, 9250, 16980, 17700, 19930, 5330, 1440, 4270, 6660, 21100, 2513, 3958, 5400, 9544, 10730, 12530, 9898, 15896, 16898, 18798, 22798, 23948
     * @param param4 Unknown parameter. Possible values: -1, 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandIsPedArrested(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 223 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 294, 252, 150, 152, 199, 271, 339, 600, 632, 85, 135, 165, 247, 1470, 180, 209, 281, 341, 366, 1050, 7040, 14040, 16050
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 430, 440, 447, 940, 1225, 1425, 2342, 2390, 3470, 3480, 4500, 4510, 4530, 4540, 4550, 8900, 970, 980, 2910, 2920, 2930, 6572, 6700, 6800, 7925, 7932, 8950, 9980, 9987, 9994, 16761, 16770, 16780, 17600, 18860, 18870, 19795, 19831, 19860, 19870, 31350, 163, 246, 15630, 16120, 16250, 3202, 3362, 3492, 3622, 16660, 16730, 16820, 16900, 17020, 17100, 17220, 17300, 5256, 5286, 18964, 18980, 1110, 1240, 1746, 1806, 6814, 7100, 6095, 6160, 11035, 11135, 12035, 12135, 3210, 3350, 5772, 18950, 21675, 21775, 21975, 22175, 673, 820, 1491, 1563, 1711, 1723, 1851, 1863, 1991, 2003, 2141, 2152, 2463, 2564, 2635, 5100, 5113, 6063, 6092, 7083, 7173, 7273, 7373, 8043, 8434, 8463, 9604, 10093, 10179, 10273, 10683, 10693, 11431, 11973, 13384, 13713, 850, 870, 1063, 1101, 3336, 17230, 24074, 24263, 25118, 25223, 25303, 25363, 26183, 26223, 26303, 26310
     * @param param3 Unknown parameter. Could be command line reference. Possible values: -1, 340, 0, 1048, 1060, 2090, 2138, 2221, 2250, 2492, 3170, 4080, 325, 580, 2525, 5300, 7465, 9142, 16380, 18300, 18422, 19110, 19405, 19570, 19581, 19655, 633, 5010, 1491, 1021, 1748, 1775, 1808, 6801, 6872, 11015, 11115, 12014, 12114, 23800, 5960, 21501, 21710, 21910, 22110, 260, 2478, 2482, 3344, 3404, 4055, 5054, 8430, 10185, 13406, 1137, 16462, 19050, 24070, 24083, 24183, 26250
     * @param param4 Unknown parameter. Possible values: -1, 0, 4, 22, 5, 42, 7, 37, 3, 74, 6, 87, 82, 26, 78, 44, 35, 77, 46, 45, 65, 83, 43
     * @param param5 Unknown parameter. Possible values: 0, 5000, 10000, 15000, 1000
     */
    private commandIsPedInCar(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 14 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 3750, 3760, 3770, 3780, 1686, 10020, 10050, 10080, 10110
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 17820, 20089, 20119, 20169, 20219
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 17722, 17724, 17726, 17728, 17802, 17806, 17810, 17814, 6852, 20068, 20098, 20148, 20187, 20191
     * @param param4 Unknown parameter. Possible values: 0, -1
     * @param param5 Unknown parameter. Always 0
     */
    private commandIsPedStunned(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 3 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 506, 223
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 6120, 10120, 10860
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandIsPlayerOnTrain(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 1650 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 271, 272, 492, 493, 494, 495, 496, 276, 277, 278, 279, 280, 557, 558, 559, 560, 561, 562, 309, 357, 358, 359, 360, 361, 310, 663, 664, 665, 666, 667, 668, 669, 670, 671, 672, 673, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 273, 274, 275, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 2610, 2630, 2650, 2670, 2690, 2710, 9050, 9060, 9070, 9080, 9090, 9100, 9110, 9120, 9130, 9140, 9150, 9160, 9170, 9180, 2525, 9001, 9002, 9003, 9004, 9005, 9006, 9007, 9008, 9009, 9010, 9011, 9012, 9013, 9014, 9015, 9016, 9017, 9018, 9019, 9020, 9021, 9030, 9031, 9032, 9033, 9034, 9035, 9037, 9038, 9039, 9051, 9052, 9053, 9054, 9055, 9056, 9057, 9058, 9059, 9061, 9062, 9063, 9064, 9065, 9066, 9067, 9068, 9069, 9071, 9072, 9073, 9074, 9075, 9076, 9077, 9078, 9079, 9081, 9082, 9083, 9084, 19000, 19001, 19002, 19003, 19004, 19005, 19006, 19007, 19008, 19009, 19010, 19011, 19012, 19013, 19014, 19015, 19016, 19017, 19018, 19019, 19020, 19021, 19022, 19023, 19024, 19025, 19030, 19031, 19032, 19033, 19034, 19035, 19036, 19037, 19038, 19039, 19040, 19041, 19050, 19051, 19052, 19053, 19054, 19055, 19056, 19057, 19058, 19059, 19060, 19061, 19062, 19063, 19064, 19065, 19066, 19067, 19068, 19069, 19070, 19071, 19072, 19073, 19074, 19075, 19076, 19077, 19078, 19079, 19080, 19081, 19082, 19084, 23013, 23014, 23500, 23501, 23502, 23503, 23504, 23505, 23506, 23507, 23508, 23509, 23510, 23511, 23512, 23012, 23010, 23011, 23000, 23001, 23002, 23003, 23004, 23005, 9036, 23006, 23007, 23008, 23009, 23015, 23016, 19083
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 10915
     * @param param3 Unknown parameter. Possible values: 9025, 9100, 9180, 9260, 9340, 9420, 10020, 31604, 31614, 31624, 31634, 31644, 31654, 31664, 31674, 31684, 31694, 31704, 12020, 12100, 12180, 12260, 12340, 12420, 13420, 104, 114, 124, 134, 144, 154, 164, 174, 184, 194, 204, 214, 224, 234, 244, 254, 264, 274, 284, 294, 304, 314, 324, 334, 344, 354, 364, 374, 384, 404, 414, 424, 434, 444, 454, 464, 474, 484, 494, 504, 514, 524, 534, 544, 554, 564, 574, 584, 594, 604, 614, 624, 634, 644, 654, 664, 674, 684, 694, 704, 714, 724, 734, 744, 754, 764, 774, 784, 794, 804, 814, 824, 834, 844, 854, 864, 874, 884, 894, 904, 914, 924, 934, 944, 954, 964, 974, 984, 994, 1004, 1014, 1024, 1034, 1044, 1054, 1064, 1074, 1084, 1040, 1140, 1240, 1340, 1440, 1540, 1640, 1740, 1840, 1940, 2040, 2140, 2240, 2340, 2440, 2540, 2640, 2740, 2840, 2940, 3040, 3140, 3240, 3340, 3440, 3540, 3640, 3740, 3840, 4040, 4140, 4240, 4340, 4440, 4540, 4640, 4740, 4840, 4940, 5040, 5140, 5240, 5340, 5440, 5540, 5640, 5740, 5840, 5940, 6040, 6140, 6240, 6340, 6440, 6540, 6640, 6740, 6840, 6940, 7040, 7140, 7240, 7340, 7440, 7540, 7640, 7740, 7840, 7940, 8040, 8140, 8240, 8340, 8440, 8540, 8640, 8740, 8840, 8940, 9040, 9140, 9240, 9440, 9540, 9640, 9740, 9840, 9940, 10040, 10140, 10240, 10340, 10440, 10540, 10640, 10740, 10840, 11411, 11511, 11611, 11711, 11811, 11911, 27050, 27110, 27170, 27230, 27290, 27350, 27410, 27470, 27530, 27590, 27650, 27710, 27770, 27830, 225, 10910, 30050, 30110, 30170, 30230, 30290, 30350, 30410, 30470, 30530, 30590, 30650, 30710, 30770, 30830, 2006, 2016, 2026, 2036, 2046, 2056, 2066, 2076, 2086, 2096, 2106, 2116, 2126, 2136, 2146, 2156, 2166, 2176, 2186, 2196, 2206, 2216, 2226, 2236, 2246, 2256, 2266, 2286, 2296, 2306, 2316, 2326, 2336, 2346, 2356, 2366, 2376, 2386, 2396, 2406, 2416, 2426, 2436, 2446, 2456, 2466, 2476, 2486, 2496, 2506, 2516, 2526, 2536, 2546, 2556, 2566, 2576, 2586, 2596, 2606, 2616, 2626, 2636, 2646, 2656, 2666, 2676, 2686, 2696, 2706, 2716, 2726, 2736, 2746, 2756, 2766, 2776, 2786, 2796, 2806, 2816, 2826, 2836, 2846, 2856, 2866, 2876, 2886, 2896, 2906, 2916, 2926, 2936, 2946, 2956, 2966, 2976, 2986, 2996, 3006, 3016, 3026, 3036, 3046, 3056, 3066, 3076, 3086, 3096, 3106, 3116, 3126, 3136, 3146, 3156, 3166, 3176, 3186, 3196, 3206, 3216, 3226, 3236, 3246, 3256, 3266, 3276, 3286, 3296, 3306, 3316, 3326, 3336, 3346, 3356, 3366, 3386, -1, 20005, 20015, 20025, 20035, 20045, 20055, 20065, 20075, 20085, 20095, 20105, 20115, 20125, 31562, 31602, 31642, 31682, 31722, 31802, 31842, 31922, 31962, 32222, 2005, 2015, 2025, 2035, 2045, 2055, 2065, 2075, 2085, 2095, 2105, 2115, 2125, 31762, 31882, 2276, 3376
     * @param param4 Unknown parameter. Possible values: 200, 75, 0, 2250, 2750, 3125, 2375, 2625, 1750, 2000, 2500, 2125, 3250
     * @param param5 Unknown parameter. Could be init line reference. Possible values: 0, 32
     */
    private commandIsPowerupDone(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 113 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Possible values: 0, -1
     * @param param5 Unknown parameter. Always 0
     */
    private commandKeepThisProc(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 32 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 90, 110, 125, 95, 105, 70, 80, 100, 85, 130
     * @param param5 Unknown parameter. Always 3502
     */
    private commandKfBriefGeneral(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 22 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 120, 100, 80
     * @param param5 Unknown parameter. Could be text reference. Possible values: 2502, 3502
     */
    private commandKfBriefTimed(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 54 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 11007, 11107, 11260, 11360, 12007, 12107, 646, 786, 29949, 31049, 31149, 746, 32449, 32549, 32649
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandKfCancelBriefing(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 32 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 665, 805, 29971, 31071, 31171, 31579, 31619, 31659, 31699, 31739, 31819, 31859, 31939, 31979, 32239, 765, 31779, 31899, 32471, 32571, 32671
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandKfCancelGeneral(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 102 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 657, 797, 29963, 31063, 31163, 31571, 31611, 31651, 31691, 31731, 31811, 31851, 31931, 31971, 32231, 757, 32463, 32563, 32663, 31771, 31891
     * @param param3 Unknown parameter. Always -1
     * @param param4 Unknown parameter. Always -1
     * @param param5 Unknown parameter. Always 0
     */
    private commandKfProcess(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 1174 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 150, 430, 494, 440, 484, 235, 250, 447, 930, 980, 940, 950, 970, 1471, 1425, 1160, 1465, 1491, 1410, 1420, 1360, 1380, 2430, 2342, 2370, 2450, 2490, 2390, 2380, 2470, 2900, 3420, 3470, 3460, 3480, 3440, 3340, 3350, 3900, 4430, 4500, 4510, 4530, 4540, 4550, 5250, 5260, 6840, 6820, 8925, 9030, 9050, 9060, 9110, 9130, 9150, 9190, 9200, 9220, 9270, 9280, 9290, 9350, 9360, 9370, 9430, 9440, 9450, 10030, 10040, 10060, 28000, 28200, 28400, 28600, 8000, 13, 960, 2800, 2730, 2910, 2920, 2930, 2710, 6650, 6700, 6520, 6505, 6800, 6530, 6570, 7970, 7962, 7925, 7900, 7350, 7980, 7932, 8860, 8950, 8890, 8700, 8800, 9890, 9980, 9940, 9915, 9250, 9260, 9987, 9970, 9994, 9640, 9620, 10840, 10820, 12030, 12040, 12050, 12110, 12120, 12150, 12190, 12200, 12220, 12270, 12280, 12290, 12350, 12360, 12380, 12430, 12440, 12450, 13030, 13040, 13050, 16802, 16761, 16990, 16930, 16965, 16770, 16980, 16780, 16550, 17400, 17600, 17700, 17500, 17900, 18600, 18650, 18770, 18860, 18830, 18800, 18870, 19710, 19795, 19831, 19750, 19860, 19900, 19980, 19785, 19930, 19940, 19775, 19870, 5000, 31320, 31350, 178, 169, 163, 218, 15450, 15690, 304, 246, 15550, 15630, 15666, 16000, 16050, 16310, 16120, 16200, 16250, 16345, 16032, 403, 409, 421, 424, 452, 431, 458, 438, 464, 445, 470, 415, 497, 522, 576, 2735, 3010, 3007, 16400, 16660, 16730, 16410, 16820, 16900, 16420, 17020, 17100, 16430, 17220, 17300, 17670, 17770, 17722, 17724, 17726, 17728, 17730, 17740, 17790, 17782, 17802, 17800, 17806, 17804, 17810, 17808, 17814, 17812, 17524, 5298, 5256, 5270, 5307, 5317, 5286, 5330, 5117, 5140, 18500, 18570, 18840, 18964, 18992, 1437, 18980, 19010, 18900, 1554, 1270, 1272, 1132, 1110, 1140, 1240, 1152, 1219, 1727, 1950, 1717, 1746, 1960, 1755, 1784, 1775, 1816, 1806, 2002, 1988, 1980, 1982, 1984, 1986, 1947, 6814, 6805, 7060, 7100, 7130, 7200, 7057, 2021, 2085, 2083, 6125, 5535, 6095, 6160, 6187, 5892, 868, 927, 6225, 6610, 6635, 6600, 6500, 2540, 2245, 2280, 2340, 2440, 2527, 11013, 11006, 11007, 11035, 11113, 11106, 11107, 11135, 11242, 11240, 11260, 11342, 11340, 11360, 11414, 11412, 11438, 11514, 11512, 11538, 11614, 11612, 11638, 11714, 11712, 11738, 11814, 11812, 11838, 11914, 11912, 11938, 12012, 12006, 12007, 12035, 12112, 12106, 12107, 12135, 15015, 25670, 23680, 23740, 23560, 23620, 23860, 23800, 23557, 23672, 23676, 517, 760, 947, 1305, 1440, 1560, 1592, 1740, 1770, 1800, 1830, 1860, 1890, 2520, 2530, 2550, 2200, 2252, 3400, 3210, 3302, 3175, 3455, 4250, 4270, 3907, 4710, 4715, 4380, 4720, 4725, 4480, 4730, 4735, 4580, 4740, 4745, 4680, 4900, 4875, 4967, 5520, 5772, 5762, 6000, 5823, 6010, 6015, 6020, 6270, 6362, 6660, 6430, 6435, 6440, 6485, 6657, 6862, 6687, 6770, 6781, 6815, 6788, 6890, 7122, 7400, 7800, 7840, 18070, 18240, 18470, 18630, 19000, 18950, 19222, 19567, 20030, 20800, 20900, 21100, 20130, 20230, 20330, 20430, 20530, 20630, 20730, 21052, 21537, 21541, 21675, 21740, 21775, 21940, 21975, 22140, 22175, 22312, 22480, 22770, 22767, 23030, 23100, 23442, 27010, 29670, 290, 256, 453, 350, 899, 507, 557, 603, 650, 673, 645, 646, 665, 661, 707, 790, 820, 785, 786, 805, 801, 1571, 1579, 1460, 1488, 1575, 1583, 1561, 2220, 2160, 1708, 2164, 1720, 2168, 2172, 2176, 1848, 2180, 2184, 2188, 2000, 2192, 2196, 2199, 2138, 2149, 2203, 2546, 2460, 2549, 2561, 2552, 2507, 2513, 2700, 2670, 2596, 2662, 2720, 2726, 2732, 2631, 2740, 3532, 3352, 3330, 3545, 3361, 3381, 3552, 3412, 3392, 3565, 3421, 3450, 3572, 3462, 3580, 3472, 3489, 3980, 3937, 3958, 3920, 5030, 4024, 5230, 5261, 5100, 5110, 5361, 5400, 5410, 5001, 4067, 6540, 6063, 6544, 6598, 6088, 6550, 6554, 6280, 6560, 6564, 6380, 6574, 6470, 6580, 6584, 7520, 7600, 7080, 7530, 7610, 7170, 7540, 7620, 7270, 7550, 7630, 7370, 8330, 8040, 8336, 8080, 8429, 8410, 8420, 8450, 8460, 9612, 9600, 9404, 9503, 9544, 10281, 10090, 10285, 10299, 10269, 10190, 10179, 10375, 10320, 10325, 10330, 10335, 10340, 10345, 10350, 10355, 10360, 10365, 10370, 10385, 10390, 10395, 11330, 11338, 11344, 10680, 11407, 10730, 11312, 10610, 10630, 10690, 11350, 11354, 10904, 11358, 11362, 10949, 11366, 11370, 11000, 11270, 11375, 11379, 11209, 11383, 11387, 11280, 11391, 11395, 11310, 12601, 11428, 12631, 11653, 11657, 11661, 11665, 11669, 11673, 12500, 12530, 11642, 11650, 12620, 11970, 12650, 12700, 12710, 12720, 12730, 12740, 12750, 12760, 12770, 12780, 12080, 12250, 12310, 12330, 12370, 12390, 13190, 13220, 13160, 13800, 13900, 13381, 13928, 13710, 13870, 13740, 14000, 15011, 15016, 15021, 15026, 15031, 15036, 15041, 27250, 27450, 27650, 29953, 29948, 29949, 29971, 29967, 31053, 31048, 31049, 31071, 31067, 31153, 31148, 31149, 31171, 31167, 31563, 31557, 31558, 31579, 31575, 31603, 31597, 31598, 31619, 31615, 31643, 31637, 31638, 31659, 31655, 31683, 31677, 31678, 31699, 31695, 31723, 31717, 31718, 31739, 31735, 31803, 31797, 31798, 31819, 31815, 31843, 31837, 31838, 31859, 31855, 31923, 31917, 31918, 31939, 31935, 31963, 31957, 31958, 31979, 31975, 32120, 32223, 32217, 32218, 32239, 32235, 720, 471, 501, 529, 898, 604, 750, 850, 745, 746, 765, 761, 870, 1230, 1260, 1250, 1063, 1098, 1322, 1300, 1150, 1136, 1339, 1880, 1900, 1710, 1670, 1920, 1930, 1940, 27800, 1970, 3170, 3269, 3161, 3334, 3343, 3630, 3700, 3800, 4000, 4100, 4200, 4300, 3590, 3597, 3620, 5006, 5190, 5580, 5340, 5221, 7250, 7450, 7241, 7242, 7243, 7244, 7710, 7890, 7283, 7740, 7920, 7383, 7770, 7910, 7483, 7583, 9310, 9798, 9898, 9291, 9306, 9740, 9745, 9750, 9755, 9760, 9765, 9770, 9775, 10900, 13400, 13580, 13750, 11710, 13930, 14110, 12060, 14290, 14470, 12480, 14830, 15010, 15380, 15796, 15896, 10391, 10406, 15161, 15171, 15181, 15191, 15201, 15211, 15221, 15231, 15241, 15251, 16202, 16186, 16798, 16898, 16460, 16940, 16945, 16950, 16955, 16960, 16970, 16975, 16985, 16995, 17340, 17081, 17230, 17280, 18090, 18270, 18631, 18640, 18697, 18798, 18550, 19960, 19050, 20300, 20310, 20320, 20056, 19880, 20400, 20500, 20600, 20700, 21195, 21980, 21985, 22698, 22798, 22370, 22377, 22380, 22392, 22404, 22420, 22431, 22441, 22450, 22490, 23140, 23180, 23220, 23260, 23898, 23948, 23720, 23730, 23750, 23760, 24210, 24070, 24220, 24250, 24261, 25500, 25570, 25116, 25222, 25620, 25303, 25361, 25700, 25710, 26190, 26183, 26360, 26220, 26310, 26291, 26300, 31411, 31416, 31421, 31426, 31431, 31436, 31441, 31446, 31763, 31757, 31758, 31779, 31775, 31883, 31877, 31878, 31899, 31895, 32453, 32448, 32449, 32471, 32467, 32553, 32548, 32549, 32571, 32567, 32653, 32648, 32649, 32671, 32667, 724
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, -1, 1301, 2540, 189, 15430, 220, 157, 252, 254, 238, 299, 649, 667, 498, 388, 586, 2761, 2976, 3652, 17660, 17525, 5110, 5017, 1530, 1046, 1035, 1215, 1905, 1913, 1931, 6820, 7050, 2025, 2079, 5550, 5595, 5506, 5888, 920, 6550, 2250, 2520, 11001, 11101, 12001, 12101, 925, 1200, 1565, 1525, 2235, 3280, 3900, 4405, 4505, 4605, 4705, 4930, 5752, 6345, 6640, 6703, 6765, 6940, 7101, 18700, 19230, 19545, 20070, 20170, 20270, 20370, 20470, 20570, 20670, 20770, 21020, 21590, 21790, 21990, 22190, 22280, 22540, 22750, 23060, 23410, 32300, 384, 637, 777, 3474, 4046, 4031, 8032, 8008, 10400, 13729, 737, 5080, 16490, 16760, 19300, 19500, 19700
     * @param param3 Unknown parameter. Could be text reference. Could be command line reference. Possible values: -1, 1301, 0
     * @param param4 Unknown parameter. Could be command line reference. Possible values: 0, -1, 10452
     * @param param5 Unknown parameter. Could be command line reference. Could be init line reference. Possible values: 0, -1, 1
     */
    private commandKickstart(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 6 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 485, 265, 200, 242, 213, 2000
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 5170, 0, -1
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 5170, -1, 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandKillCar(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 4 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 240, 241
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandKillDrop(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 81 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 140, 198, 199, 240, 16, 17, 18, 19, 20, 21, 22, 23, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 122, 125, 128, 182, 3020, 245, 174, 175, 176, 177, 1278, 7460, 390, 391, 392, 393
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, -1, 389, 6537
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Could be command line reference. Possible values: 0, 1000
     */
    private commandKillObj(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 54 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 252, 299, 300, 301, 302, 249, 233, 237, 382, 383, 345, 346, 347, 350, 351, 352, 146, 147, 148, 395, 335, 336, 163, 1460, 1810, 1830, 5100, 5200, 5300, 5400, 5900, 6000, 6100, 6200, 492, 1160, 1180, 470, 480, 490, 500, 510, 520, 530, 540, 550, 560, 570, 580, 590, 600, 610, 620
     * @param param2 Unknown parameter. Could be text reference. Could be command line reference. Possible values: 0, -1, 2600
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandKillPed(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 9 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 327, 341, 479, 363, 17717
     * @param param2 Unknown parameter. Possible values: -1, 0
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Possible values: -1, 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandKillProcess(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 179 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 32001, 113, 107, 361, 282, 316, 322, 346, 345, 562, 605, 560, 775, 785, 1035, 1007, 1060, 1218, 1263, 1333, 1334, 1331, 1332, 2025, 2048, 2009, 2125, 2185, 2205, 2105, 2278, 2270, 2535, 3102, 3105, 3045, 3183, 3185, 3186, 3187, 3515, 4055, 4103, 4217, 4247, 4277, 4032, 5013, 5014, 6065, 6070, 8116, 31304, 437, 415, 518, 2042, 2235, 2415, 2505, 2015, 6040, 6058, 6033, 6247, 6175, 7036, 7035, 7085, 7228, 7308, 7427, 7425, 8035, 8095, 8231, 8262, 8264, 9108, 9106, 9045, 9175, 9149, 9150, 9151, 9328, 9375, 9526, 9593, 10065, 10070, 16036, 16015, 16111, 16325, 16324, 16180, 16398, 16399, 16395, 17012, 17154, 17036, 17037, 18278, 18267, 18255, 18445, 18431, 18140, 18145, 19085, 19045, 19130, 19559, 19475, 19505, 19593, 19591, 31223, 31217
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, -1, 822, 4273, 9690
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, -1, 822, 4273, 9690
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandKillSideProc(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 418 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 1333, 1334, 1218, 1007, 1263, 2205, 2009, 2105, 3185, 3515, 4032, 5013, 5014, 6070, 8116, 415, 2561, 6247, 7035, 7425, 8035, 8231, 9150, 9151, 9045, 9149, 9108, 9328, 10070, 16399, 16111, 19045, 19475, 19591, 19545, 25015, 156, 15440, 152, 235, 237, 254, 233, 259, 616, 609, 610, 622, 637, 638, 575, 3132, 3174, 3282, 3334, 3412, 3464, 3542, 3594, 17711, 17712, 17713, 17714, 17652, 5002, 5021, 5130, 5017, 5019, 5032, 5030, 1320, 1318, 1408, 1427, 1428, 1436, 1447, 1452, 1476, 1024, 1025, 1034, 1740, 1770, 1804, 1742, 1713, 1702, 1745, 1767, 1800, 6803, 6832, 6804, 6882, 6883, 5589, 5552, 5511, 822, 6392, 6472, 6495, 2215, 15013, 23641, 1108, 1295, 3150, 3112, 3441, 5514, 5506, 5895, 5815, 5945, 5830, 6484, 6415, 6420, 6425, 6716, 6712, 6844, 29660, 27009, 18025, 18185, 18415, 18620, 19220, 21535, 21530, 21735, 21730, 21935, 21930, 22135, 22130, 23095, 206, 205, 340, 30164, 506, 503, 1412, 1422, 1418, 1419, 1512, 1522, 1518, 1618, 1622, 1623, 1676, 1674, 1739, 1761, 1762, 1820, 1822, 1879, 1902, 1901, 1963, 1960, 2019, 2042, 2041, 2098, 2096, 2396, 2447, 2449, 2445, 2484, 2490, 2577, 2578, 2588, 2606, 2619, 2615, 2616, 2617, 3315, 3318, 3349, 3385, 3388, 3409, 3455, 3886, 3884, 4008, 4030, 4028, 4029, 4037, 4038, 4039, 6012, 6086, 6040, 6042, 6192, 6233, 6292, 6333, 6433, 6471, 7007, 7052, 7096, 7142, 7192, 7242, 7292, 7342, 8007, 8016, 8017, 8032, 8073, 8443, 9006, 9031, 10007, 10032, 10042, 10111, 10110, 10452, 10488, 10490, 10583, 10582, 10462, 10651, 10653, 10581, 10580, 10715, 10862, 10902, 10906, 10947, 10952, 11001, 10997, 11162, 11207, 11212, 11254, 11282, 11421, 11426, 11424, 11464, 11465, 11466, 11467, 11468, 11536, 11535, 11533, 11534, 11852, 11866, 11868, 11880, 11881, 11882, 11883, 11884, 11885, 11886, 11887, 11888, 13070, 13152, 13251, 13377, 13379, 13312, 13510, 13511, 13731, 13738, 32103, 30179, 468, 471, 1012, 1052, 1033, 1074, 1075, 1032, 1737, 1738, 1736, 1768, 1766, 3020, 3272, 5004, 5071, 5020, 5150, 7036, 7039, 7042, 7045, 7280, 7380, 7480, 7580, 9117, 9116, 10390, 10389, 16182, 17012, 17080, 17082, 18093, 18005, 18457, 18456, 18252, 19012, 19010, 19874, 20065, 19033, 20095, 19165, 20145, 19392, 20184, 19592, 22306, 22304, 24063, 24052, 24113, 24105, 25113, 25683, 25693, 25153, 25062, 25283, 25333, 26171, 26216, 26212, 26151, 26252, 26284
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 1450, 2349, 3330, 4394, 6224, 810, 6351, 7915, 8391, 9690, 10240, 16750, 16742, 19823, 200, 237, 288, 17739, 17754, 1964, 1965, 1966, 1938, 1942, 1956, -1, 15086, 15130, 15210, 15290, 6732, 1662, 2526, 20091, 20141, 20180, 20230
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, 1450, 2349, 3330, 4394, -1, 6224, 810, 6351, 7915, 8391, 9690, 10240, 16750, 16742, 19823
     * @param param4 Unknown parameter. Could be command line reference. Could be init line reference. Possible values: 0, 1, -1, 2
     * @param param5 Unknown parameter. Possible values: 0, -1, 10000, 5000, 1000, 30000, 3000, 15000
     */
    private commandKillSpecProc(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 55 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 44, 122, 125, 128, 182, 3740, 3020, 245, 172, 174, 175, 176, 177, 18, 41, 61, 78, 59, 55, 52, 11800, 370, 1278, 1210, 1230, 1250, 1270, 1610, 111, 1970, 30, 63, 43, 64, 13, 37, 38, 6, 7460, 339, 341, 343, 390, 391, 392, 393, 462, 476, 477, 478, 480, 481, 482, 23400
     * @param param2 Unknown parameter. Possible values: -1, 0
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Could be init line reference. Possible values: 0, 16, 32, 64
     */
    private commandLocate(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 41 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 319, 277, 136, 120, 123, 126, 180, 131, 190, 191, 192, 193, 212, 3280, 238, 242, 920, 950, 970, 1200, 1220, 1240, 1260, 1410, 1610, 365, 730, 1000, 2000, 4040, 4050, 4060, 4070, 12040, 13000, 13010, 13020, 13030, 13040, 15010
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 603, 328, 341, 479, 363, 509, 6716
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Possible values: -1, 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandLockDoor(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 76 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 16, 17, 18, 19, 20, 21, 22, 23, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 122, 125, 128, 182, 3020, 245, 174, 175, 176, 177, 1278, 7460, 390, 391, 392, 393
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 486, 488, 490
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandMakeobj(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Show huge text middle of the screen.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 4315, 221, 312, 525, 526, 2499, 11026, 11126, 11248, 11348, 12026, 12126, -1, 32270, 670, 32271, 810, 32272, 29977, 32273, 31077, 32274, 31177, 32275, 32255, 31584, 32276, 32256, 31624, 32277, 32257, 31664, 32278, 32258, 31704, 32279, 32259, 31744, 32280, 32260, 31824, 32281, 32261, 31864, 32282, 32262, 31944, 32283, 32263, 31984, 32284, 32264, 32244, 770, 31784, 31904, 32265, 32266, 32477, 32285, 32577, 32286, 32677
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, 4315, -1
     * @param param4 Unknown parameter. Always 0
     * @param text Reference to text.
     */
    private commandMessageBrief(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 91 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 475, 0, 1450, 1892, 2940, 3330, 4394, 5170, 6224, 2676, 4340, 6351, 9690, 10240, 17276, 18581, 15621, 16030, 495, 520, 3005, 3671, 5115, 1552, 945, 1590, 2250, 3300, 3905, 4965, 5760, 6360, 6655, 6779, 7120, 19565, 21050, 22310, 22765, 23440
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 475, 0, 1450, 1892, 2940, 3330, 4394, 5170, 6224, 2676, 4340, 6351, 9690, 10240, 17276, 18581, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Possible values: 0, 50000, 25000, 30000, 35000, 40000, 45000, 20000
     */
    private commandMissionEnd(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 1062 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 0, 227, 267
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 475, 896, 830, 1450, 1400, 1892, 6900, 2349, 3330, 4397, 5170, 6224, -1, 20000, 2630, 2676, 6351, 7912, 7915, 7909, 9670, 9690, 10240, 16742, 17272, 17276, 18581, 19823, 31291, 9000, 333, 345, 354, 367, 5002, 1021, 1217, 1702, 1931, 1945, 1883, 6801, 7055, 2081, 5890, 925, 6560, 2525, 15016, 15000, 1610, 3512, 6736, 18150, 18330, 18600, 21501, 21710, 21910, 22110, 27005, 32300, 27700, 6590, 8392, 8073, 11399, 11438, 32100, 1144, 1780, 17330, 18610, 19832, 25240, 27100
     * @param param3 Unknown parameter. Possible values: 0, 475, 896, 830, 1450, 1400, 1892, 6900, 2349, 3, 3330, 5170, 6224, -1, 20000, 44, 2630, 2676, 6351, 7912, 7915, 7909, 9670, 9690, 10240, 16742, 17276, 18581, 19823, 31291, 1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Could be text reference. Possible values: 1001, 1003, 1010, 1014, 1015, 1008, 1016, 1017, 1440, 1013, 1012, 1021, 1024, 1025, 1026, 1028, 1031, 1029, 1030, 1036, 1037, 1044, 1038, 1041, 1042, 1049, 1051, 1050, 1043, 1046, 1047, 1048, 1045, 1053, 1055, 1056, 1441, 1060, 1501, 1430, 1069, 1066, 1067, 1068, 1075, 1076, 1431, 1078, 1079, 1432, 1087, 1088, 1083, 1084, 1086, 1504, 1446, 1110, 1111, 1112, 1433, 1113, 1095, 1096, 1097, 1104, 1102, 1434, 1105, 1506, 1507, 1528, 1529, 1447, 1115, 1116, 1435, 1117, 1118, 1125, 1130, 1126, 1128, 1127, 1129, 1136, 1138, 1400, 1403, 1402, 1401, 1355, 1356, 1357, 1359, 1360, 1364, 1518, 1519, 1246, 1248, 1250, 1251, 1252, 1253, 1259, 1257, 1260, 1261, 1262, 1258, 1280, 1284, 1285, 1381, 1289, 1329, 1292, 1293, 1295, 1517, 1508, 1300, 1301, 1307, 1303, 1304, 1305, 1306, 1509, 1510, 1309, 1310, 1311, 1312, 1314, 1316, 1317, 1511, 1318, 1319, 1330, 1322, 1324, 1325, 1331, 1332, 1333, 1334, 1512, 1370, 1371, 1372, 1373, 1374, 1375, 1216, 1527, 1219, 1220, 1228, 1230, 1231, 1225, 1226, 1227, 1229, 1236, 1237, 1238, 1239, 1240, 1241, 1264, 1266, 1271, 1272, 1273, 1274, 1336, 1337, 1339, 1342, 1344, 1345, 1346, 1514, 1515, 1516, 1347, 1348, 1351, 1404, 1407, 1405, 1422, 1200, 1206, 1204, 1442, 1208, 1209, 1443, 1444, 1445, 2193, 2004, 2005, 2006, 2008, 2009, 2007, 2011, 2012, 2016, 2014, 2015, 2017, 2018, 2013, 2019, 2020, 2024, 2025, 2026, 2196, 2027, 2028, 2030, 2184, 2033, 2041, 2042, 2043, 2035, 2037, 2039, 2044, 2045, 2047, 2048, 2053, 2054, 2055, 2056, 2057, 2059, 2060, 2062, 2063, 2065, 2066, 2068, 2069, 2070, 2071, 2072, 2073, 2074, 2075, 2076, 2077, 2078, 2471, 2081, 2472, 2082, 2083, 2084, 2087, 2088, 2198, 2092, 2093, 2090, 2091, 2183, 2094, 2095, 2096, 2097, 2098, 2099, 2100, 2101, 2102, 2103, 2104, 2185, 2108, 2111, 2112, 2113, 2110, 2115, 2116, 2117, 2125, 2119, 2121, 2123, 2127, 2126, 2186, 2133, 2134, 2136, 2137, 2139, 2140, 2142, 2144, 2145, 2148, 2149, 2150, 2187, 2155, 2151, 2152, 2153, 2154, 2156, 2157, 2160, 2161, 2164, 2166, 2168, 2170, 2172, 2176, 2174, 2175, 2177, 2178, 2181, 2190, 2188, 2182, 2189, 2105, 2194, 2195, 2001, 2475, 2479, 2489, 2480, 2481, 2482, 2483, 2484, 2485, 2450, 2202, 2203, 2204, 2355, 2358, 2359, 2357, 2360, 2209, 2354, 2210, 2211, 2212, 2214, 2215, 2216, 2218, 2213, 2454, 2455, 2394, 2234, 2368, 2364, 2235, 2299, 2365, 2367, 2406, 2407, 2240, 2241, 2242, 2243, 2244, 2245, 2246, 2247, 2370, 2369, 2249, 2398, 2251, 2253, 2255, 2361, 2404, 2393, 2408, 2409, 2379, 2262, 2459, 2263, 2460, 2461, 2264, 2266, 2267, 2380, 2265, 2271, 2269, 2395, 2270, 2378, 2383, 2384, 2386, 2385, 2387, 2388, 2389, 2391, 2462, 2463, 2465, 2277, 2363, 2278, 2279, 2280, 2281, 2282, 2300, 2410, 2301, 2302, 2303, 2304, 2305, 2306, 2307, 2453, 2308, 2309, 2310, 2311, 2312, 2314, 2315, 2316, 2317, 2318, 2324, 2319, 2320, 2405, 2321, 2322, 2323, 2325, 2488, 2327, 2490, 2328, 2411, 2329, 2330, 2331, 2332, 2333, 2334, 2335, 2336, 2337, 2338, 2342, 2343, 2344, 2345, 2346, 2348, 2349, 2451, 2452, 2390, 2476, 3270, 3849, 3007, 3013, 3003, 3005, 3008, 3006, 3271, 3009, 3011, 3014, 3010, 3771, 3772, 3773, 3017, 3027, 3023, 3019, 3020, 3024, 3022, 3025, 3056, 3077, 3071, 3072, 3059, 3060, 3073, 3063, 3064, 3074, 3067, 3068, 3075, 3079, 3076, 3078, 3029, 3032, 3030, 3039, 3038, 3037, 3034, 3035, 3187, 3185, 3177, 3178, 3179, 3183, 3189, 3181, 3182, 3180, 3186, 3184, 3774, 3775, 3776, 3777, 3778, 3779, 3780, 3781, 3782, 3783, 3050, 3042, 3049, 3044, 3052, 3046, 3053, 3047, 3048, 3054, 3117, 3116, 3118, 3081, 3082, 3083, 3085, 3087, 3084, 3092, 3086, 3088, 3089, 3090, 3091, 3094, 3093, 3097, 3109, 3099, 3098, 3110, 3100, 3102, 3104, 3106, 3108, 3111, 3112, 3113, 3191, 3200, 3192, 3193, 3194, 3195, 3196, 3197, 3198, 3199, 3201, 3202, 3204, 3209, 3205, 3208, 3207, 3210, 3213, 3211, 3212, 3214, 3215, 3206, 3217, 3222, 3218, 3221, 3219, 3220, 3223, 3224, 3158, 3154, 3157, 3153, 3121, 3123, 3122, 3125, 3143, 3146, 3127, 3129, 3131, 3133, 3134, 3136, 3241, 3138, 3140, 3144, 3141, 3142, 3145, 3147, 3160, 3168, 3161, 3175, 3163, 3164, 3165, 3169, 3166, 3167, 3174, 3170, 3173, 3171, 3172, 3848, 3231, 3226, 3227, 3228, 3232, 3236, 3234, 3235, 3238, 3240, 3770, 3769, 3798, 3794, 3538, 3558, 3539, 3559, 3540, 3562, 3847, 3541, 3543, 3561, 3542, 3546, 3544, 3545, 3547, 3825, 3555, 3556, 3557, 3563, 3560, 3570, 3571, 3565, 3568, 3753, 3573, 3799, 3838, 3827, 3839, 3804, 3578, 3581, 3580, 3577, 3579, 3582, 3583, 3585, 3595, 3586, 3587, 3588, 3589, 3590, 3596, 3598, 3600, 3603, 3601, 3602, 3605, 3608, 3607, 3611, 3610, 3613, 3616, 3619, 3617, 3618, 3628, 3630, 3627, 3814, 3632, 3826, 3633, 3636, 3634, 3639, 3637, 3638, 3651, 3641, 3643, 3840, 3841, 3842, 3644, 3646, 3648, 3652, 3642, 3655, 3645, 3662, 3657, 3659, 3661, 3660, 3664, 3668, 3671, 3669, 3670, 3845, 3679, 3674, 3682, 3680, 3675, 3676, 3681, 3691, 3687, 3689, 3690, 3686, 3692, 3694, 3695, 3705, 3697, 3698, 3709, 3699, 3700, 3707, 3701, 3710, 3702, 3703, 3704, 3706, 3711, 3803, 3715, 3722, 3725, 3716, 3723, 3719, 3727, 3720, 3721, 3726, 3728, 3730, 3729, 3749
     */
    private commandMobileBrief(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 7 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 188, 191, 195, 246, 18340, 18370, 18410
     * @param param2 Unknown parameter. Possible values: -1, 0
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Possible values: 3, 4, 2
     * @param param5 Unknown parameter. Always 0
     */
    private commandModelHunt(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 12 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 68, 105, 48, 3500, 5800, 5900, 4, 0, 67
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 100, 17210, 120, 170, 196, 110, 210, 310
     * @param param3 Unknown parameter. Always 4
     * @param param4 Unknown parameter. Always 30
     * @param param5 Unknown parameter. Possible values: 100, 0
     */
    private commandMphone(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 8 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 400, 406, 418, 412, 17732, 17734, 17736, 5061
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 353, -1
     * @param param3 Unknown parameter. Possible values: -1, -2
     * @param param4 Unknown parameter. Could be command line reference. Possible values: 327, 341, 363, 479, 17717, 4008
     * @param param5 Unknown parameter. Possible values: -1, 0
     */
    private commandNextKick(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 199, 240
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandObtain(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 21 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 267, 320, 276, 280, 566, 570, 129, 206, 207, 249, 214, 215, 1310, 1311, 1630, 2516, 7742, 7741
     * @param param2 Unknown parameter. Could be text reference. Could be command line reference. Possible values: 0, 1300, -1
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandOpenDoor(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Shows a text in pager.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Possible values: -1, 0
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param text Text reference.
     */
    private commandPBrief(line: number, param1: number, param2: number, param3: number, param4: number, text: number): void {
    }

    /**
     * Unknown function. Used 42 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Possible values: 0, -1
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Possible values: 18, 60, 120, 90, 80, 100, 30, 320, 440, 160, 400, 200
     * @param param5 Unknown parameter. Could be text reference. Possible values: 1500, 2502, 3502
     */
    private commandPBriefTimed(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 51 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 191, 254, 224, 151, 229, 201, 245, 227, 192, 267, 570, 616, 615, 318, 320, 272, 276, 566, 568, 599, 603, 630, 637, 141, 117, 119, 269, 129, 209, 249, 930, 6240, 7300, 178, 394, 248, 253, 255, 256, 282, 461, 473, 474, 1200, 14060, 15060
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 15442, 15682, 392
     * @param param3 Unknown parameter. Could be init line reference. Possible values: 0, -1, 11850, 11851, 11855, 11852, 11853, 11854, 11800, 11810, 11820, 24500, 24507, 24501, 24502, 24503, 24504, 24505, 24506, 24508, 24509, 24510, 24511, 14062, 15062
     * @param param4 Unknown parameter. Possible values: 3, 0, 2, 1
     * @param param5 Unknown parameter. Possible values: 20000, 50000, 15000, 40000, 30000, 35000, 45000, 0, 1000, 4000, 6000, 10000
     */
    private commandPark(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 135 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 189, 253, 230, 198, 244, 247, 265, 612, 315, 319, 327, 270, 277, 578, 593, 628, 629, 627, 139, 116, 118, 136, 120, 123, 180, 126, 131, 190, 191, 192, 193, 3720, 205, 162, 148, 149, 150, 151, 3000, 3010, 213, 212, 3280, 238, 242, 700, 710, 720, 730, 920, 1200, 1220, 1240, 1260, 1375, 1410, 1380, 1510, 1520, 1530, 7385, 7390, 7392, 7393, 7394, 7395, 7396, 7397, 6000, 6030, 6060, 6110, 7610, 175, 249, 250, 251, 252, 279, 483, 283, 340, 342, 350, 351, 365, 374, 395, 396, 397, 398, 425, 426, 427, 428, 429, 445, 463, 464, 475, 479, 650, 652, 740, 750, 760, 770, 780, 790, 800, 810, 1000, 1030, 1160, 2000, 4040, 4050, 4060, 4070, 8000, 12040, 13000, 13010, 13030, 13040, 14010, 15010, 15030, 15050, 16030
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 150, 230, 16242, 327, 499, 501, 500, 5591, 11964
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Possible values: 0, 1000
     */
    private commandParkedOn(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 6140, 6150
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 19500
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandParkedPixelsOn(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 18 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 253, 238, 198, 270, 373, 593, 640, 136, 248, 279, 365, 1030, 7000, 14050, 14010, 16030
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Could be command line reference. Could be init line reference. Possible values: 400, 0, -1
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 252, 150, 152, 199, 271, 339, 600, 632, 135, 247, 281, 366, 1050, 7040, 14040, 16050
     * @param param5 Unknown parameter. Always 0
     */
    private commandPedBack(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 392 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 252, 299, 300, 301, 302, 249, 233, 237, 382, 383, 384, 385, 386, 387, 388, 267, 268, 150, 152, 227, 228, 199, 304, 225, 226, 238, 332, 295, 323, 324, 325, 326, 255, 256, 250, 345, 346, 347, 351, 271, 146, 147, 148, 335, 336, 339, 595, 596, 597, 598, 604, 605, 606, 607, 600, 601, 602, 608, 609, 631, 632, 633, 135, 121, 124, 181, 127, 183, 184, 185, 186, 187, 188, 3750, 3760, 3770, 3780, 3272, 3274, 163, 165, 3070, 3080, 158, 159, 3022, 3024, 3026, 3028, 247, 168, 169, 170, 139, 140, 141, 142, 143, 257, 258, 259, 260, 261, 262, 263, 264, 254, 240, 241, 246, 172, 11800, 11810, 370, 380, 390, 400, 410, 420, 425, 310, 320, 330, 340, 350, 741, 770, 771, 772, 773, 774, 775, 776, 777, 778, 779, 780, 781, 980, 990, 1000, 1005, 1210, 1230, 1250, 1270, 1302, 1303, 1304, 1305, 1306, 1307, 1308, 1309, 1470, 1615, 1810, 1830, 1890, 1900, 1910, 1920, 1930, 1940, 1980, 1990, 6010, 6020, 6040, 6050, 6070, 6080, 6090, 6100, 6160, 6170, 6180, 6190, 6200, 6210, 6220, 6230, 7100, 7110, 7120, 7130, 7140, 7150, 7160, 7170, 7400, 7410, 7420, 7430, 7440, 7450, 7630, 7640, 7650, 7660, 7670, 7680, 7690, 7700, 7701, 7702, 9500, 9510, 9520, 9530, 213, 970, 281, 285, 286, 287, 341, 343, 352, 353, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 366, 367, 368, 376, 377, 378, 379, 423, 424, 431, 432, 433, 434, 435, 436, 437, 438, 439, 440, 441, 442, 443, 430, 447, 448, 449, 451, 452, 453, 454, 455, 456, 457, 458, 462, 8550, 465, 466, 467, 468, 469, 470, 471, 472, 476, 477, 478, 480, 481, 482, 670, 680, 690, 700, 710, 1050, 1090, 1100, 1110, 1120, 1130, 1140, 1150, 23400, 1020, 1080, 2060, 2070, 2080, 2090, 3000, 3020, 4000, 4010, 4020, 4030, 5000, 5010, 5020, 5030, 5040, 5050, 5060, 5070, 5080, 5090, 5130, 5140, 5150, 5160, 5170, 5180, 5182, 5184, 6030, 6060, 6110, 6120, 6130, 6140, 6150, 7190, 7200, 7040, 7050, 7060, 7080, 7090, 9010, 9020, 9030, 9040, 9050, 9000, 10000, 10020, 10050, 10080, 10110, 11100, 11070, 11170, 11120, 11030, 11130, 11160, 11090, 11190, 12000, 12010, 12020, 12030, 12280, 12282, 12050, 12060, 12070, 14040, 16050
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 1969, 6811, 23455
     * @param param3 Unknown parameter. Could be command line reference. Possible values: -1, 0, 2668, 342, 1905, 1907, 1909, 1911, 23500, 1230, 1240, 1250, 1260, 1270, 1280
     * @param param4 Unknown parameter. Possible values: 0, 147, 134, 146, 41, 139, 140, 136, 142, 137, 145, 19, 133, 33, 144, 132, 135, 138, 38, 30, 15, 143, 154, 155, 156, 170, 171, 172
     * @param param5 Unknown parameter. Could be init line reference. Possible values: 0, 85, -1, 209
     */
    private commandPedOn(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 40 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 319, 277, 579, 136, 131, 212, 3280, 238, 242, 920, 950, 960, 970, 1272, 1280, 1290, 1300, 1380, 1410, 1610, 175, 240, 241, 483, 365, 1000, 2000, 13020, 13000, 13010, 13030, 13040, 15010
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 16340
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandPedOutOfCar(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 19 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 3272, 3274, 3070, 3080, 158, 159, 1274, 1460, 7100, 7110, 7120, 7130, 7140, 7150, 7160, 7170, 339, 341, 343
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Possible values: 0, -1
     * @param param5 Unknown parameter. Always 0
     */
    private commandPedPolice(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 131 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 251, 250, 389, 390, 391, 392, 488, 489, 490, 403, 404, 296, 342, 343, 623, 643, 644, 645, 646, 647, 648, 649, 650, 651, 394, 337, 338, 688, 634, 635, 641, 642, 275, 460, 470, 480, 450, 440, 430, 540, 550, 560, 570, 580, 590, 747, 1450, 1840, 2010, 2030, 2020, 9550, 9540, 9560, 181, 214, 3500, 3600, 3700, 3800, 4300, 4400, 4500, 4600, 491, 23200, 23201, 23202, 23203, 23204, 23205, 23206, 23207, 1020, 310, 320, 330, 340, 350, 360, 370, 380, 400, 410, 420, 1030, 1110, 1120, 1130, 2100, 2110, 2120, 2130, 3082, 3083, 3084, 3085, 3086, 3087, 3088, 3089, 3090, 3030, 3093, 3092, 4080, 4090, 4100, 4110, 9070, 10030, 10060, 10090, 10120, 10140, 12230, 12240, 12250
     * @param param2 Unknown parameter. Possible values: 0, -1
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 249, 237, 225, 295, 622, 255, 395, 335, 687, 631, 163, 380, 390, 400, 410, 420, 425, 741, 1460, 1830, 1990, 1890, 1900, 9500, 9510, 9520, 9530, 180, 213, 5100, 5900, 492, 451, 452, 453, 454, 455, 456, 457, 458, 1160, 1180, 470, 510, 550, 590, 1020, 1080, 1090, 1100, 2060, 2070, 2080, 2090, 3000, 3020, 4000, 4010, 4020, 4030, 9000, 10000, 12050, 12060, 12070
     * @param param5 Unknown parameter. Always 0
     */
    private commandPedSendto(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 164 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 238, 3024, 3026, 3028, 11800, 770, 771, 772, 773, 774, 775, 776, 777, 778, 779, 780, 781, 6040, 6050, 6070, 6080, 6090, 6100, 6160, 6170, 6180, 6190, 6200, 6210, 6220, 6230, 7150, 7160, 7170, 7630, 7640, 7650, 7660, 7670, 7680, 7690, 7700, 7701, 7702, 240, 492, 287, 355, 358, 363, 367, 368, 23633, 467, 471, 1090, 1110, 1140, 2060, 2070, 2080, 2090, 3000, 4000, 4010, 4020, 4030, 5130, 6120, 7110, 7120, 9010, 9020, 9030, 9040, 9050, 12000, 12010, 12020, 12030, 12280, 12282, 13160, 13140, 13150, 13170, 13180
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, -1, 23010, 7283, 7383, 7483, 7583
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Possible values: 2, 4, 3
     * @param param5 Unknown parameter. Always 0
     */
    private commandPedWeapon(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 6 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 200, 205, 210, 215, 220, 7000
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandPixelCarOn(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 167 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 306, 307, 308, 309, 310, 322, 330, 332, 333, 341, 342, 311, 313, 315, 316, 323, 325, 334, 337, 345, 317, 326, 338, 339, 347, 348, 350, 352, 360, 364, 367, 372, 373, 374, 319, 328, 340, 353, 357, 371, 7480, 7490, 7500, 7510, 7520, 7530, 7540, 7550, 7560, 7570, 7580, 7582, 7584, 7586, 7588, 7590, 7592, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 381, 382, 383, 384, 385, 386, 387, 388, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422, 820, 830, 840, 850, 860, 870, 880, 890, 900, 910, 920, 930, 940, 950, 8050, 8060, 8070, 8080, 8090, 8100, 8110, 8120, 8130, 8140, 8150, 8160, 8170, 8180, 8190, 8200, 9080, 9090, 9100, 9110, 9120, 9130, 9140, 9150, 9160, 12080, 12090, 12100, 12110, 12120, 12130, 12140, 12150, 12160, 12170, 12180, 15100, 15110, 15120, 15130, 15140, 15150, 15160, 15170
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 18724, 18826
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Possible values: 0, 2, 1, 3
     * @param param5 Unknown parameter. Possible values: 0, 25000, 2000, 30000
     */
    private commandPlainExplBuilding(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 485, 1000
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 5269, 0
     * @param param3 Unknown parameter. Possible values: 0, 1210
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandPlayerAreBothOnscreen(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 32 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 23013, 23014, 23012, 23010, 23011, 23000, 23001, 23002, 23003, 23004, 23005, 23006, 23007, 23008, 23009, 23015, 23016
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 29977, 31077, 31177, 32477, 32577, 32677
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 10000
     */
    private commandPowerupOff(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 4072 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 528, 529, 531, 532, 534, 535, 537, 443, 444, 445, 457, 458, 472, 538, 539, 491, 540, 446, 447, 459, 460, 468, 476, 478, 541, 543, 448, 449, 461, 462, 469, 473, 450, 470, 477, 451, 463, 464, 471, 474, 484, 452, 465, 481, 453, 454, 466, 479, 393, 527, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 436, 437, 438, 439, 271, 272, 276, 277, 278, 279, 280, 492, 493, 494, 495, 496, 507, 508, 509, 510, 512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525, 526, 545, 546, 547, 556, 557, 558, 559, 560, 561, 562, 497, 498, 533, 551, 501, 502, 552, 503, 504, 542, 553, 536, 505, 506, 548, 554, 563, 544, 550, 499, 500, 440, 441, 442, 455, 456, 467, 475, 480, 482, 483, 309, 310, 357, 358, 359, 360, 361, 652, 653, 654, 655, 656, 663, 664, 665, 666, 667, 668, 669, 670, 671, 672, 673, 490, 511, 530, 549, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 10, 20, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 273, 274, 275, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 120, 992, 993, 997, 3785, 3740, 994, 9520, 995, 9470, 996, 9050, 320, 330, 340, 350, 370, 380, 390, 580, 590, 600, 610, 620, 630, 640, 650, 660, 680, 690, 700, 710, 720, 740, 750, 760, 770, 780, 790, 800, 810, 820, 830, 840, 850, 860, 870, 880, 890, 900, 910, 920, 930, 940, 950, 960, 970, 980, 990, 9800, 9810, 9820, 9830, 9840, 9850, 9000, 9001, 9002, 9003, 9004, 9005, 9006, 9007, 9008, 9009, 9010, 9011, 9012, 9013, 9014, 9015, 9016, 9017, 9018, 9019, 9020, 9021, 9022, 9023, 9024, 9060, 9070, 9080, 9090, 9100, 9110, 9120, 9130, 9140, 9150, 9160, 9180, 9170, 2610, 2630, 2650, 2670, 2690, 2710, 11010, 11020, 11030, 11040, 11050, 11060, 11070, 11080, 11090, 11100, 11110, 11120, 11130, 11140, 11150, 11160, 11170, 11180, 11190, 11200, 11210, 11220, 11230, 11240, 11250, 11260, 11270, 11280, 11290, 11300, 11320, 11340, 11350, 11360, 11370, 11380, 11390, 11400, 11410, 11420, 11430, 11440, 11450, 11460, 11470, 11480, 11490, 11500, 11510, 11520, 11530, 11540, 11550, 11560, 11570, 11580, 11590, 11600, 11610, 11620, 11630, 11640, 11650, 11660, 11670, 11680, 11690, 11700, 11701, 11702, 11710, 595, 596, 1325, 1330, 1335, 7171, 7180, 5010, 5020, 5030, 5040, 5050, 5060, 5070, 5080, 5090, 5100, 5110, 5120, 5130, 5140, 5150, 5160, 5170, 5180, 5190, 5200, 5210, 5220, 5230, 5240, 5250, 5260, 5270, 5280, 5290, 5300, 5320, 5330, 5340, 5350, 5360, 5370, 5380, 5390, 5400, 5410, 5420, 5430, 5440, 5450, 5460, 5470, 5480, 5490, 5500, 5510, 5520, 5530, 5540, 5550, 5560, 5570, 5580, 5590, 5600, 5610, 5620, 5630, 5640, 5650, 5660, 5670, 5680, 5690, 5700, 5701, 5702, 2525, 5710, 7455, 11330, 9030, 9031, 9032, 9033, 9034, 9035, 9037, 9038, 9039, 9051, 9052, 9053, 9054, 9055, 9056, 9057, 9058, 9059, 9061, 9062, 9063, 9064, 9065, 9066, 9067, 9068, 9069, 9071, 9072, 9073, 9074, 9075, 9076, 9077, 9078, 9079, 9081, 9082, 9083, 9084, 19000, 19001, 19002, 19003, 19004, 19005, 19006, 19007, 19008, 19009, 19010, 19011, 19012, 19013, 19014, 19015, 19016, 19017, 19018, 19019, 19020, 19021, 19022, 19023, 19024, 19025, 19030, 19031, 19032, 19033, 19034, 19035, 19036, 19037, 19038, 19039, 19040, 19041, 19050, 19051, 19052, 19053, 19054, 19055, 19056, 19057, 19058, 19059, 19060, 19061, 19062, 19063, 19064, 19065, 19066, 19067, 19068, 19069, 19070, 19071, 19072, 19073, 19074, 19075, 19076, 19077, 19078, 19079, 19080, 19081, 19082, 19084, 23013, 23014, 20682, 20684, 23500, 23501, 23502, 23503, 23504, 23505, 23506, 23507, 23508, 23509, 23510, 23511, 23512, 23012, 23010, 23011, 23000, 23001, 23002, 23003, 23004, 23005, 23006, 23007, 23008, 23009, 23301, 23302, 23303, 23304, 23305, 23306, 23307, 23308, 23309, 23310, 23311, 23312, 23313, 23314, 23315, 23316, 23317, 23318, 23319, 23320, 23321, 23322, 23323, 23324, 23325, 9036, 9085, 9101, 9102, 9103, 9104, 9105, 9106, 9107, 9108, 9109, 9111, 9112, 9113, 9114, 9115, 9116, 9117, 9118, 9119, 9121, 9122, 9123, 9124, 9125, 9126, 9127, 23015, 23016, 19028, 19027, 19026, 19083, 19085, 19101, 19102, 19103, 19104, 19105, 19106, 19107, 19108, 19109, 19110, 19111, 19112, 19113, 19114, 19115, 19116, 19117, 19118, 19119, 19120, 19121, 19122, 19123, 19124, 19125, 19126
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 2349, 7942, -1, 371, 17700, 26270, 15001, 5516, 29005, 29655, 27001, 30002
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, 2349, 7942, -1
     * @param param4 Unknown parameter. Possible values: 0, -1
     * @param param5 Unknown parameter. Always 0
     */
    private commandPowerupOn(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 8 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 304, 570, 3995, 9450, 23400
     * @param param2 Unknown parameter. Possible values: -1, 0
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Possible values: 0, -1
     * @param param5 Unknown parameter. Always 0
     */
    private commandRedArrow(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 5 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Possible values: 0, -1
     * @param param5 Unknown parameter. Always 0
     */
    private commandRedArrowOff(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 24 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 249, 295, 631, 632, 633, 3300, 947, 1350, 1360, 1370, 180, 492, 23633, 1160, 1180, 13160, 13140, 13150, 13170, 13180, 15193
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Possible values: 136, 140, 145, 144, 147, 138, 134
     * @param param5 Unknown parameter. Always 0
     */
    private commandRemapPed(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 497 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 60, 70, 80, 90, 11000, 475, 0, 1450, -1, 3330, 3880, 6224, 5000, 8396, 9690, 10240, 17276, 31291, 587, 596, 1734, 2555, 2543, 32300, 18940, 18960
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, 11000, 475, 1450, -1, 3330, 3880, 6224, 8396, 9690, 5000, 10240, 17276, 31291
     * @param param4 Unknown parameter. Possible values: 0, -1
     * @param param5 Unknown parameter. Possible values: 0, -1
     */
    private commandReset(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 280 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, -1, 32290, 29980, 31080, 31180, 32480, 32580, 32680
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Possible values: -1, 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandResetKf(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Always -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandResetWithBriefs(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 37 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 17120, 11220, 11320, 23100, 29944, 31044, 31144, 32444, 32544, 32644
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 32290
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandReturnControl(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 8 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Possible values: 1000000, 2000000, 3000000, 5000000
     * @param param2 Unknown parameter. Possible values: 0, -1
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 8010, 5004, 15404, 0, 28020, 32002, 27002
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandScoreCheck(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 46 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 215, 319, 277, 579, 136, 131, 3720, 235, 240, 245, 230, 260, 265, 270, 255, 1380, 1410, 1610, 175, 251, 252, 483, 365, 1000, 2000, 14010, 15010
     * @param param2 Unknown parameter. Possible values: -1, 0
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 217, 376, 377, 378, 218, 618, 619, 621, 282, 283, 284, 393, 587, 584, 585, 586, 3047, 132, 3730, 225, 250, 1400, 1430, 1631, 179, 275, 276, 277, 278, 485, 372, 1010, 2040, 14020, 15020
     * @param param5 Unknown parameter. Always 0
     */
    private commandSendto(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 14 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 160, 235, 290, 375, 399, 400, 401, 402, 20915, 2172, 8040, 15090, 16070
     * @param param2 Unknown parameter. Possible values: 0, -1
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Could be command line reference. Possible values: 1047, 1034, 5591, 2621, 6085, 7042, 7134, 7234, 7334, 8442, 3275, 17053, 25252, 26255
     * @param param5 Unknown parameter. Always 1
     */
    private commandSetKilltrig(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 15 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 1200, 1220, 1240, 1260, 1410, 283, 374, 20912, 730, 2000, 8000, 12040, 15050, 16030
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 11861
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandSetNoCollide(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 20 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 237, 255, 631, 3750, 3760, 3770, 3780, 11810, 1686, 5100, 5900, 470, 510, 550, 590, 10020, 10050, 10080, 10110
     * @param param2 Unknown parameter. Possible values: 0, -1
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Possible values: 3, 4, 2
     * @param param5 Unknown parameter. Always 0
     */
    private commandSetPedSpeed(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 35 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 230, 297, 485, 265, 612, 565, 213, 920, 295, 299, 301, 303, 305, 307, 309, 311, 313, 18440, 18460, 18480, 18500, 18520, 18540, 18560, 18580, 18600, 18620
     * @param param2 Unknown parameter. Possible values: 0, -1
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Could be command line reference. Possible values: 4, 0, 6, 1, 2
     * @param param5 Unknown parameter. Possible values: 0, 20000, 25000, 15000, 40000
     */
    private commandSetbomb(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 189, 253
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 190, 263
     * @param param5 Unknown parameter. Always 0
     */
    private commandSetupRepo(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 313 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 274, -1, 16720, 19810, 31288, 17722, 17724, 17726, 17728, 17746, 17400, 833, 5585, 1588, 1736, 1876, 2016, 2207, 10290, 13738, 27700, 32300
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, 274, -1, 9, 16720, 19810, 31288
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Could be text reference. Possible values: 1004, 1005, 1006, 1009, 1019, 1018, 1011, 1007, 1022, 1023, 1027, 1039, 1040, 1061, 1062, 1063, 1064, 1065, 1071, 1070, 1503, 1072, 1502, 1077, 1080, 1081, 1082, 1085, 1505, 1098, 1099, 1100, 1101, 1103, 1106, 1137, 1358, 1361, 1362, 1363, 1247, 1249, 1254, 1256, 1255, 1286, 1287, 1288, 1290, 1291, 1294, 1302, 1352, 1308, 1313, 1315, 1320, 1321, 1323, 1326, 1327, 1328, 1513, 1217, 1221, 1223, 1224, 1222, 1232, 1218, 1265, 1267, 1268, 1269, 1270, 1275, 1335, 1338, 1340, 1341, 1343, 1350, 1349, 1517, 1201, 1202, 1203, 1207, 1205, 2021, 2023, 2029, 2034, 2036, 2038, 2040, 2046, 2051, 2052, 2058, 2061, 2064, 2067, 2079, 2467, 2468, 2469, 2470, 2466, 2080, 2089, 2109, 2113, 2118, 2120, 2122, 2124, 2128, 2129, 2130, 2131, 2013, 2135, 2138, 2141, 2143, 2487, 2158, 2159, 2165, 2167, 2169, 2171, 2173, 2179, 2180, 2474, 2486, 2356, 2207, 2208, 2217, 2366, 2371, 2372, 2373, 2374, 2375, 2376, 2377, 2457, 2250, 2252, 2254, 2259, 2362, 2473, 2261, 2458, 2381, 2464, 2339, 2233, 2260, 2313, 2206, 2340, 2341, 3002, 3015, 3012, 3744, 3026, 3018, 3021, 3057, 3058, 3061, 3062, 3065, 3066, 3069, 3070, 3031, 3033, 3036, 3188, 3272, 3041, 3049, 3051, 3043, 3045, 3115, 3095, 3101, 3103, 3105, 3107, 3149, 3155, 3150, 3151, 3152, 3156, 3120, 3124, 3126, 3128, 3130, 3132, 3135, 3137, 3139, 3162, 3229, 3230, 3233, 3239, 3746, 3537, 3551, 3552, 3553, 3563, 3554, 3566, 3567, 3572, 3569, 3575, 3800, 3576, 3591, 3592, 3593, 3594, 3599, 3609, 3606, 3614, 3615, 3621, 3622, 3623, 3624, 3629, 3625, 3626, 3635, 3816, 3817, 3818, 3819, 3820, 3821, 3822, 3824, 3823, 3843, 3844, 3658, 3665, 3672, 3666, 3667, 3684, 3685, 3688, 3696, 3802, 3717, 3718, 3724, 3731, 3732, 3733, 3734, 3735, 3736, 3737, 3738, 3739, 3740, 3741, 3742, 3743, 3748
     */
    private commandSpeechBrief(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 12 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 582, 2570, 2600, 7470, 18754, 18714, 18734
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 579, -1
     * @param param5 Unknown parameter. Could be init line reference. Possible values: 3, 100, 5
     */
    private commandStartModel(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 6 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 303, 425, 83, 120, 173, 210
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 30000, 132, 0
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 30000, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandStartup(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 255 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 189, 253, 221, 230, 238, 198, 244, 265, 152, 612, 315, 327, 270, 273, 565, 373, 593, 628, 640, 139, 116, 118, 136, 190, 191, 192, 193, 205, 3240, 162, 3100, 3000, 3010, 248, 212, 213, 700, 710, 720, 730, 920, 1375, 6110, 7310, 7330, 7350, 7370, 7610, 175, 243, 249, 250, 251, 252, 279, 283, 483, 340, 342, 365, 374, 395, 396, 397, 398, 408, 20912, 425, 445, 463, 464, 475, 479, 650, 652, 1030, 1000, 2000, 14050, 15030, 15050, 16030
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 162, 161, 253, 245, 244, 15627, 15625, 16110, 16100, 16240, 16230, 16657, 16655, 16720, 16715, 16810, 16800, 16890, 16880, 17010, 17000, 17090, 17080, 17210, 17200, 17290, 17280, 5051, 5254, 5252, 5284, 5282, 18962, 18960, 18978, 18976, 1109, 1108, 1235, 1230, 6813, 6812, 7097, 7095, 6090, 6085, 6155, 6150, 3208, 3206, 3345, 3340, 5772, 5771, 18940, 18935, 21673, 21671, 21773, 21771, 21973, 21971, 22173, 22171, 1489, 1488, 1561, 1560, 1709, 1708, 1721, 1720, 1849, 1848, 1861, 1860, 1989, 1988, 2001, 2000, 2139, 2138, 2150, 2149, 2461, 2460, 2561, 2632, 2631, 5100, 5111, 5110, 6063, 6093, 6088, 7083, 7080, 7173, 7170, 7273, 7270, 7373, 7370, 8043, 8040, 8463, 8460, 9604, 9600, 10090, 10269, 10683, 10680, 10693, 10690, 11431, 11428, 11973, 11970, 13384, 13381, 13710, 1063, 1061, 1101, 1097, 3336, 3333, 24260, 25118, 25115, 25223, 25220, 25303, 25300, 25363, 25360, 26183, 26223, 26220, 26300, 26309
     * @param param3 Unknown parameter. Could be command line reference. Possible values: -1, 0, 6065, 2410, 2420, 2430
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 0, 100, 200, 3000
     * @param param5 Unknown parameter. Possible values: 5000, 0, 10000, 15000, 8500, 1000, 4000, 6000, 11000
     */
    private commandSteal(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 122 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 271, 272, 492, 493, 494, 495, 496, 309, 357, 358, 359, 360, 361, 310, 2610, 2630, 2650, 2670, 2690, 2710, 9030, 9031, 9032, 9033, 9034, 9035, 9036, 9037, 9038, 9039, 19030, 19031, 19032, 19033, 19034, 19035, 19036, 19037, 19038, 19039, 19040, 19041
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandStopFrenzy(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Waits for a given amount of ticks.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Possible values: 0, 100
     * @param nextCommand Next command line. -1 to stop processing. 0 to jump nect line.
     * @param param3 Unknown parameter. Possible values: 30, 0, 892, 1200, -1, 8010, 280, 50, 4320, 5004, 10, 9500, 600, 900
     * @param time Ticks to wait.
     * @param money Get money when wait expires.
     */
    private commandSurvive(line: number, param1: number, nextCommand: number, param3: number, param4: number, money: number): void {
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 199, 240
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Possible values: 200, 242
     * @param param5 Unknown parameter. Possible values: 50000, 0
     */
    private commandThrow(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 14 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 2676
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, 2676
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandUnfreezeEnter(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 27 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 319, 277, 578, 136, 131, 212, 3280, 238, 242, 920, 1020, 1040, 1060, 1380, 365, 1000, 2000, 13020, 13000, 13010, 13030, 13040, 15010
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, 614, 578, 4086, 4099
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Possible values: -1, 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandUnlockDoor(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 100 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 251, 250, 389, 390, 391, 392, 488, 489, 490, 403, 404, 296, 342, 343, 623, 643, 644, 645, 646, 647, 648, 649, 650, 651, 394, 337, 338, 688, 634, 635, 641, 642, 275, 1450, 2010, 2030, 2020, 181, 214, 3500, 3600, 3700, 3800, 4300, 4400, 4500, 4600, 491, 1020, 310, 320, 330, 340, 350, 360, 370, 380, 400, 410, 420, 430, 440, 450, 460, 1030, 2100, 2110, 2120, 2130, 3082, 3083, 3084, 3085, 3086, 3087, 3088, 3089, 3090, 3030, 3093, 3092, 4080, 4090, 4100, 4110, 9070, 10030, 10060, 10090, 10120, 10140, 12230, 12240, 12250
     * @param param2 Unknown parameter. Could be command line reference. Possible values: 0, -1, 19900, 7800, 7840, 478, 489, 402, 418, 434, 450
     * @param param3 Unknown parameter. Possible values: 780, 784, -1, 0, 5910, 3420, 3430, 3440, 3450, 7270, 7370, 7470, 7570
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 249, 237, 225, 295, 622, 255, 395, 335, 687, 631, 163, 1460, 1990, 1890, 1900, 180, 213, 5100, 5900, 492, 1160, 1180, 470, 510, 550, 590, 1020, 2060, 2070, 2080, 2090, 3000, 3020, 4000, 4010, 4020, 4030, 9000, 10000, 12050, 12060, 12070
     * @param param5 Unknown parameter. Always 0
     */
    private commandWaitForPed(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 60 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 230, 330, 430, 510, 530, 630, 710, 180, 280, 380, 480, 580, 680, 730, 780, 810, 830, 930, 952
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandWaitForPlayers(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 506, 223
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Always -1
     * @param param4 Unknown parameter. Always -1
     * @param param5 Unknown parameter. Possible values: 50000, 0
     */
    private commandWreckATrain(line: number, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }
}

class Counter {
    private currentValue: number;

    constructor(initialValue: number) {
        this.currentValue = initialValue;
    }

    public valueChange: ((newValue: number) => void) | null = null;

    public get value() {
        return this.currentValue;
    }

    public set value(newValue) {
        if (this.currentValue !== newValue) {
            this.currentValue = newValue;
            this.valueChange?.(newValue);
        }
    }
}

interface ICoordinates {
    readonly x: number;
    readonly y: number;
    readonly z: number;
}
