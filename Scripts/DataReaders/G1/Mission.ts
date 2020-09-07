import Vehicle from "../../WorldEntities/Vehicle";
import Game from "../../Game";
import { IMission } from "./MissionReader";
import Character from "../../WorldEntities/Character";
import Trigger from "../../WorldEntities/Trigger";
import GameScriptBase from "../../GameScriptBase";

const FramesPerSecond = 25;

type InitLineFunction = (line: number | null, reset: boolean, coordinates: ICoordinates, param1?: number, param2?: number, param3?: number, param4?: number, param5?: number) => unknown;
type CommandLineFunction = (line: number | null, object: number, success: number, fail: number, data: number, scoreOrText: number) => (number | ICommandResult);
export default class Mission extends GameScriptBase {
    private missionData: IMission;
    private initMap: Record<string, InitLineFunction> = {
        "ALT_DAMAGE_TRIG": this.initAltDamageTrig as InitLineFunction,
        "BARRIER": this.initBarrier as InitLineFunction,
        "BASIC_BARRIER": this.initBasicBarrier as InitLineFunction,
        "BLOCK_INFO": this.initBlockInfo as InitLineFunction,
        "BOMBSHOP": this.initBombshop as InitLineFunction,
        "BOMBSHOP_COST": this.initBombshopCost as InitLineFunction,
        "CANNON_START": this.initCannonStart as InitLineFunction,
        "CARBOMB": this.initCarbomb as InitLineFunction,
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
        "DRIVER": this.initDriver as InitLineFunction,
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
    private commandMap: Record<string, CommandLineFunction> = {
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
    private commandReferences = new Map<number, number>();
    private threads: Thread[] = [];

    constructor(missionData: IMission) {
        super();
        this.missionData = missionData;
    }

    public initialize(game: Game) {
        super.initialize(game);

        for (const line of this.missionData.initLines) {
            const func = this.initMap[line.commandName];
            if (func) {
                //console.log(`Init ${line.commandName} (${line.coordinateX}, ${line.coordinateY}, ${line.coordinateZ})`);
                const result = func.call(this, line.lineNumber, line.reset, { x: line.coordinateX, y: line.coordinateY, z: line.coordinateZ }, line.param1, line.param2, line.param3, line.param4, line.param5);
                if ((line.lineNumber !== void 0) && (line.lineNumber !== null) && (result !== void 0) && (result !== null)) {
                    this.initReferences.set(line.lineNumber, result);
                }
            }
        }

        for (let i = 0; i < this.missionData.commandLines.length; i++) {
            const line = this.missionData.commandLines[i];
            if (typeof line.lineNumber === "number") {
                this.commandReferences.set(line.lineNumber, i);
            }
        }
    }

    public update() {
        for (const thread of this.threads) {
            // Runs commands until there is a jump to specific location. This keeps long procedures to be runned on same sitting, but loops are tried only once per update.
            let keepGoing = true;
            while (keepGoing) {
                const line = this.missionData.commandLines[thread.pointer];
                const func = this.commandMap[line.commandName];
                if (func) {
                    let next = func.call(this, line.lineNumber, line.param1, line.param2, line.param3, line.param4, line.param5);
                    if (typeof next === "number") {
                        if (next === -1) {
                            next = { exitThread: true };
                        } else if (next === 0) {
                            next = { lineJump: 1 };
                        } else {
                            next = { commandReference: next };
                        }
                    }

                    if (next.commandReference === 0) {
                        next = { ...next, commandReference: void 0, lineJump: 1 };
                    }

                    if (next.exitThread) {
                        keepGoing = false;
                        thread.stop();
                        this.threads.splice(this.threads.indexOf(thread), 1);
                    } else if (typeof next.lineJump === "number") {
                        thread.pointer += next.lineJump;
                    } else if (typeof next.commandReference === "number") {
                        keepGoing = false;
                        const nextCommand = this.commandReferences.get(next.commandReference);
                        if (nextCommand !== void 0) {
                            thread.pointer = nextCommand;
                        } else {
                            console.error(`Invalid command reference (${next}).`);
                            thread.pointer++;
                        }
                    }
                } else {
                    keepGoing = false;
                    thread.stop();
                    this.threads.splice(this.threads.indexOf(thread), 1);
                }
            }
        }
    }

    //public runCommandLine(commandName: string, lineReference: number, ...parameters: number[]) {
    //    const func = this.commandMap[commandName];
    //    if (func) {
    //        const result = func(lineReference, ...parameters);
    //        if ((result !== void 0) && (result !== null)) {
    //            this.commandReferences.set(lineReference, result);
    //        }
    //    }
    //}

    private startThread(entryPoint: number): void {
        const newThread = new Thread();
        const firstCommand = this.commandReferences.get(entryPoint);
        if (firstCommand !== void 0) {
            newThread.pointer = firstCommand;
            this.threads.push(newThread);
        } else {
            console.error(`Invalid command reference (${entryPoint}).`);
        }

    }

    /**
     * Unknown function. Used 1 times.
     * @param line Line number of command.
     * @param reset Always false.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Always 1052
     * @param param2 Unknown parameter. Always 2
     */
    private initAltDamageTrig(line: number, reset: never, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Creates a barrier that can only be opened by emergency vehicles. <num frames> is the  number of frames of animation. <type> is the interior block to use.
     * @param line Line number of command.
     * @param reset Whether to keep the object when RESET happens.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param face Direction of door face. 0 - West, 1 - East, 2 - North, 3 - South.
     * @param numFrames frames Vehicle type to allow through.
     * @param interior Door interior style.
     */
    private initBarrier(line: number, reset: boolean, coordinates: ICoordinates, face: number, numFrames: number, interior: number): void {
    }

    /**
     * Unknown function. Used 4 times.
     * @param line Line number of command.
     * @param reset Whether to keep the object when RESET happens.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param direction Direction of door face. 0 - West, 1 - East, 2 - North, 3 - South.
     * @param param2 Unknown parameter. Always 4
     * @param param3 Unknown parameter. Always 0
     */
    private initBasicBarrier(line: number, reset: never, coordinates: ICoordinates, direction: number, param2: number, param3: number): void {
    }

    /**
     * Unknown function. Used 253 times.
     * @param line Line number of command.
     * @param reset Whether to keep the object when RESET happens.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 0, 4, 48, 1, 2, 3
     * @param param2 Unknown parameter. Could be init line reference. Possible values: 0, 100, 8
     */
    private initBlockInfo(line: number, reset: boolean, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Creates a bomb shop trigger that places a bomb in your current car for a price!
     * @param line Line number of command.
     * @param reset Always true.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Always 0
     * @param param2 Always 0
     */
    private initBombshop(line: number, reset: never, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 1 times.
     * @param line Line number of command.
     * @param reset Always true.
     * @param coordinates. Not used.
     * @param param1 Unknown parameter. Always 1000
     * @param param2 Unknown parameter. Always 0
     */
    private initBombshopCost(line: number, reset: never, coordinates: never, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 9 times.
     * @param line Line number of command.
     * @param reset Always false.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Always 0
     */
    private initCannonStart(line: number, reset: never, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Creates a car with a bomb in it.
     * @param line Line number of command.
     * @param reset Always false.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param type Type can be following: 0 - No Bomb (disarm), 1 - Unarmed 5 second bomb, 2 - Armed 5 second bomb, 3 - Model Car Bomb, 4 - Dodgy Explosives (blow on damage), 5 - Unarmed speed bomb (>3/4 max speed to arm), 6 - Armed speed bomb (<1/2 max speed to detonate)
     * @param angle Angle of the car
     */
    private initCarbomb(line: number, reset: never, coordinates: ICoordinates, type: number, angle: number): void {
    }

    /**
     * Unknown function. Used 9 times.
     * @param line Line number of command.
     * @param reset Always false.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 3100, 162, 1675, 365, 374, 20912, 1000, 15050, 16030
     * @param param2 Unknown parameter. Possible values: 1032, 1445, 6744, 4033, 6082, 8440, 1069, 25320, 26200
     */
    private initCarbombTrig(line: number, reset: never, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 23 times.
     * @param line Line number of command.
     * @param reset Whether to keep the object when RESET happens.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 5700, 6525, 6565, 6605, 7940, 2225, 6100, 7430, 7450, 7470, 7490, 3540, 3560, 8100, 3502, 7291, 7391, 7491, 7591, 17360, 22530, 25390, 26320
     * @param param2 Unknown parameter. Possible values: 2, 1, 4, 3
     * @param param3 Unknown parameter. Could be init line reference. Possible values: 213, 1510, 1520, 1530, 1610, 283, 374, 395, 396, 397, 398, 340, 342, 20912, 2000, 4040, 4050, 4060, 4070, 8000, 12040, 15050, 16030
     */
    private initCardestroyTrig(line: number, reset: boolean, coordinates: ICoordinates, param1: number, param2: number, param3: number): void {
    }

    /**
     * Unknown function. Used 5 times.
     * @param line Line number of command.
     * @param reset Always false.
     * @param coordinates. Not used.
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 280, 2650, 4079, 3577, 25680
     * @param param2 Unknown parameter. Could be init line reference. Possible values: 175, 483, 365, 2000, 15010
     */
    private initCarstuckTrig(line: number, reset: never, coordinates: never, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 71 times.
     * @param line Line number of command.
     * @param reset Whether to keep the object when RESET happens.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Possible values: 3000, 2000, 4000, 2500, 3500, 5000, 6000, 31220, 19000, 10000, 3600, 8000, 7000, 9000, 100, 17035, 11000, 11100, 11200, 11300, 12000, 12100, 6510, 6550, 6590, 1000, 1020, 1040, 2900, 2910, 2920, 2930, 2940, 2950, 2960, 2970, 2980, 2990, 600, 702, 10600, 31038, 31138, 29938, 17050, 28000, 28030, 28060, 29000, 29100, 29200, 29300, 29400, 29500, 29600, 29700, 29800, 29900, 32538, 32638, 32438
     * @param param2 Unknown parameter. Could be init line reference. Possible values: 196, 238, 256, 295, 297, 485, 502, 139, 209, 213, 219, 246, 251, 333, 348, 374, 578, 2500, 2530, 2550, 2580, 2730, 2750, 1510, 1520, 1530, 182, 184, 186, 299, 301, 303, 305, 307, 309, 311, 313, 3000, 8020, 464, 18700, 18720, 18740, 300, 802, 8000, 18280, 18300, 18320, 18440, 18460, 18480, 18500, 18520, 18540, 18560, 18580, 18600, 18620
     */
    private initCartrigger(line: number, reset: boolean, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 22 times.
     * @param line Line number of command.
     * @param reset Always false.
     * @param coordinates. Not used.
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 577, 613, 872, 6280, 6455, 5900, 3439, 3920, 4000, 4110, 4860, 5870, 6200, 6837, 13719, 4093, 3534, 23350, 23450, 23550, 23650, 25690
     * @param param2 Unknown parameter. Could be init line reference. Possible values: 131, 136, 3280, 238, 242, 212, 920, 950, 960, 970, 1272, 1380, 1410, 1610, 1000, 365, 2000, 13000, 13010, 13030, 13040, 15010
     */
    private initCarwaitTrig(line: number, reset: never, coordinates: never, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param reset Whether to keep the object when RESET happens.
     * @param coordinates. Command coordinates in pixels. (0-16383)
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Always 0
     */
    private initChopperEndpoint(line: number, reset: boolean, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 55 times.
     * @param line Line number of command.
     * @param reset Whether to keep the object when RESET happens.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 628, 3200, 3360, 3490, 3620, 3170, 3330, 3460, 3590, 6910, 6850, 257, 5665, 3260, 3222, 5560, 5562, 5564, 21610, 21810, 22010, 22210, 1672, 2480, 2623, 1812, 1952, 2092, 4073, 4053, 4042, 7090, 7180, 7280, 7380, 8050, 10106, 2475, 11510, 11982, 13391, 8480, 32390, 32393, 32396, 9241, 9243, 9700, 1110, 17120, 17160, 25140, 25370, 26240
     * @param param2 Unknown parameter. Could be init line reference. Possible values: 2, 0, 1, 12, 6, 4, 7
     * @param param3 Unknown parameter. Could be init line reference. Possible values: 136, 190, 191, 192, 193, 248, 118, 213, 920, 1375, 7310, 7330, 7350, 7370, 249, 279, 283, 250, 251, 252, 365, 395, 396, 397, 398, 408, 445, 650, 652, 1030, 20912, 208, 425, 1000, 2000, 8000, 15030, 15050, 16030
     */
    private initCorrectCarTrig(line: number, reset: boolean, coordinates: ICoordinates, param1: number, param2: number, param3: number): void {
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param reset Always false.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 5062, 24080
     * @param param2 Unknown parameter. Always 1
     * @param param3 Unknown parameter. Could be init line reference. Possible values: 4, 22
     */
    private initCorrectModTrig(line: number, reset: never, coordinates: ICoordinates, param1: number, param2: number, param3: number): void {
    }

    /**
     * Defines a counter that can be used for looped missions with the DECCOUNT command, e.g. for keeping track of the number of cars you’ve brought to a specific location.
     * @param line Line number of command.
     * @param reset Whether to keep the object when RESET happens.
     * @param coordinates. Not used.
     * @param count Initial count.
     * @param param2 Always 0
     */
    private initCounter(line: number, reset: boolean, coordinates: never, count: number, param2: number): void {
    }

    /**
     * Unknown function. Used 24 times.
     * @param line Line number of command.
     * @param reset Always true.
     * @param coordinates. Command coordinates in pixels. (0-16383)
     * @param param1 Unknown parameter. Could be command line reference. Could be init line reference. Possible values: 1, -1
     * @param param2 Unknown parameter. Could be angle. Possible values: 512, 0
     */
    private initCrane(line: number, reset: never, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param reset Always false.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 6752, 23180
     * @param param2 Unknown parameter. Always 1
     */
    private initDamageTrig(line: number, reset: never, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Creates a door of type <type> on face <face> of a building, with interior block <interior>.
     * @param line Line number of command.
     * @param reset Whether to keep the object when RESET happens.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param face Direction of door face. 0 - West, 1 - East, 2 - North, 3 - South.
     * @param type Door exterior style.
     * @param interior Door interior style.
     */
    private initDoor(line: number, reset: boolean, coordinates: ICoordinates, direction: number, type: number, interior: number): void {
    }

    /**
     * Creates a player pedestrian inside car <car>.
     * @param line Line number of command.
     * @param reset Whether to keep the object when RESET happens.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Always 0
     * @param car Car model.
     */
    private initDriver(line: number, reset: boolean, coordinates: ICoordinates, param1: number, car: number) {

    }

    /**
     * Unknown function. Used 68 times.
     * @param line Line number of command.
     * @param reset Whether to keep the object when RESET happens.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Possible values: 1065, 5390, 5500, 5380, 9705, 9720, 9740, 5400, 5420, 5440, 1980, 1900, 1930, 1950, 8500, 8520, 8350, 8380, 8400, 9580, 7500, 7520, 7540, 7070, 7100, 7120, 16500, 16520, 16220, 16250, 16270, 17300, 17320, 17340, 17360, 17150, 7700, 7720, 7300, 590, 17600, 364, 370, 380, 390, 424, 430, 440, 450, 5860, 6230, 6300, 6722, 6727, 234, 241, 1595, 1598, 1601, 1607, 1610, 5049, 2583, 1604, 13080, 3150, 24160, 25520
     * @param param2 Unknown parameter. Possible values: 3, 4, 1, 2, 0
     * @param param3 Unknown parameter. Could be init line reference. Possible values: 230, 215, 277, 234, 260, 335, 567, 579, 319, 131, 3720, 225, 250, 1380, 1410, 1610, 175, 251, 252, 365, 483, 1000, 2000, 14010, 15010
     */
    private initDumMissionTrig(line: number, reset: boolean, coordinates: ICoordinates, param1: number, param2: number, param3: number): void {
    }

    /**
     * Unknown function. Used 3 times.
     * @param line Line number of command.
     * @param reset Always false.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 2440, 31100, 31110
     * @param param2 Unknown parameter. Possible values: 2, 3
     * @param param3 Unknown parameter. Could be init line reference. Possible values: 741, 9500
     */
    private initDumPedBlockTrig(line: number, reset: never, coordinates: ICoordinates, param1: number, param2: number, param3: number): void {
    }

    /**
     * Unknown function. Used 397 times.
     * @param line Line number of command.
     * @param reset Whether to keep the object when RESET happens.
     * @param coordinates. Command coordinates in pixels. (0-16383)
     * @param param1 Unknown parameter. Always 0
     * @param param2 Unknown parameter. Possible values: 1, 0, 3, 2
     */
    private initDummy(line: number, reset: boolean, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 9 times.
     * @param line Line number of command.
     * @param reset Always false.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Always 2
     * @param param2 Unknown parameter. Always 0
     */
    private initFinalMulti(line: number, reset: never, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     *  Defines an object that can be created in the future (eg. a Suitcase)
     * @param line Line number of command.
     * @param reset Whether to keep the object when RESET happens.
     * @param coordinates. Command coordinates in pixels. (0-16383)
     * @param type Object type.
     * @param angle Object angle.
     */
    private initFuture(line: number, reset: boolean, coordinates: ICoordinates, type: number, angle: number): void {
    }

    /**
     * Unknown function. Used 227 times.
     * @param line Line number of command.
     * @param reset Whether to keep the object when RESET happens.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Possible values: 43, 18, 4, 41, 44, 22, 34, 1, 17, 5, 0, 13, 35, 19, 9, 29, 27, 31, 6, 2, 26, 62, 55, 58, 65, 54, 66, 64, 51, 63, 7, 50, 86, 61, 45, 42, 70, 3, 74, 87, 82, 78, 77, 46, 81, 83, 72, 73, 80, 75
     * @param param2 Unknown parameter. Could be angle. Possible values: 512, 256, 768, 0
     */
    private initFuturecar(line: number, reset: boolean, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 424 times.
     * @param line Line number of command.
     * @param reset Whether to keep the object when RESET happens.
     * @param coordinates. Command coordinates in pixels. (0-16383)
     * @param param1 Unknown parameter. Possible values: 0, 4, 22, 2, 9, 21, 23, 14, 5, 46, 24, 1, 12, 26
     * @param param2 Unknown parameter. Possible values: 0, 512, 256, 768, 2
     */
    private initFutureped(line: number, reset: boolean, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 6 times.
     * @param line Line number of command.
     * @param reset Always true.
     * @param coordinates. Not used.
     * @param param1 Unknown parameter. Possible values: 0, 2, 3
     * @param param2 Unknown parameter. Possible values: 18, 22, 27
     * @param param3 Unknown parameter. Always -1
     * @param param4 Unknown parameter. Always 2
     */
    private initGtaDemand(line: number, reset: never, coordinates: never, param1: number, param2: number, param3: number, param4: number): void {
    }

    /**
     * Unknown function. Used 23 times.
     * @param line Line number of command.
     * @param reset Always false.
     * @param coordinates. Not used.
     * @param param1 Unknown parameter. Possible values: 2050, 6990, 1220, 3910, 3980, 4060, 4170, 6855, 7210, 270, 275, 3610, 5500, 5210, 5560, 7320, 7420, 7520, 7620, 16380, 21943, 21963, 21973
     * @param param2 Unknown parameter. Could be init line reference. Possible values: 169, 250, 3070, 980, 990, 1000, 1005, 1686, 1810, 180, 213, 2000, 3000, 4000, 4010, 4020, 4030, 7040, 11030, 11070, 11090
     */
    private initGunScreenTrig(line: number, reset: never, coordinates: never, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 20 times.
     * @param line Line number of command.
     * @param reset Whether to keep the object when RESET happens.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 1710, 520, 1320, 9961, 250, 7951, 10510, 10520, 14994, 3779, 8402, 9095, 18430, 18440, 18450, 18504, 18510, 18514, 23300, 31391
     * @param param2 Unknown parameter. Possible values: 3, 2, 1, 5, 0
     */
    private initGunTrig(line: number, reset: boolean, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Creates a gang member on vehicle.
     * @param line Line number of command.
     * @param reset Always false.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param carType Type of the car
     * @param angle Angle of the car.
     */
    private initHells(line: number, reset: never, coordinates: ICoordinates, carType: number, angle: number): void {
    }

    /**
     * Unknown function. Used 9 times.
     * @param line Line number of command.
     * @param reset Always false.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Always 10
     * @param param2 Unknown parameter. Always 0
     */
    private initMidMultiSetup(line: number, reset: never, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 51 times.
     * @param line Line number of command.
     * @param reset Always false.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
     * @param param2 Unknown parameter. Could be init line reference. Possible values: 2, 1, 3
     */
    private initMidpointMulti(line: number, reset: never, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 8 times.
     * @param line Line number of command.
     * @param reset Whether to keep the object when RESET happens.
     * @param coordinates. Not used.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 4, 5, 10, 16
     * @param param2 Unknown parameter. Always 0
     */
    private initMissionCounter(line: number, reset: boolean, coordinates: never, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 7 times.
     * @param line Line number of command.
     * @param reset Whether to keep the object when RESET happens.
     * @param coordinates. Not used.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 11, 13, 18, 16
     * @param param2 Unknown parameter. Always 0
     */
    private initMissionTotal(line: number, reset: boolean, coordinates: never, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param reset Always true.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Always 2
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Always 4
     * @param param4 Unknown parameter. Always 4
     */
    private initModelBarrier(line: number, reset: never, coordinates: ICoordinates, param1: number, param2: number, param3: number, param4: number): void {
    }

    /**
     * Unknown function. Used 8 times.
     * @param line Line number of command.
     * @param reset Always false.
     * @param coordinates. Not used.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 1730, 1740, 1750, 1760, 13000, 13010, 13020, 13030
     * @param param2 Unknown parameter. Possible values: 1, 0
     * @param param3 Unknown parameter. Always 4
     */
    private initMovingTrig(line: number, reset: never, coordinates: never, param1: number, param2: number, param3: number): void {
    }

    /**
     * Unknown function. Used 14 times.
     * @param line Line number of command.
     * @param reset Always false.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 131, 238, 242, 920, 950, 960, 970, 1272, 175, 483, 1000, 365, 2000, 15010
     * @param param2 Unknown parameter. Possible values: 1, 0
     */
    private initMovingTrigHired(line: number, reset: never, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Unknown function. Used 12 times.
     * @param line Line number of command.
     * @param reset Always true.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 27, 10, 15050, 17200, 17400, 110, 160, 195, 100, 200, 300
     * @param param2 Unknown parameter. Possible values: 3, 2
     */
    private initMphones(line: number, reset: never, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Creates an object of type <type> facing <angle>.
     * @param line Line number of command.
     * @param reset Always false.
     * @param coordinates. Command coordinates in pixels. (0-16383)
     * @param type Object type.
     * @param angle Object angle.
     */
    private initObject(line: number, reset: never, coordinates: ICoordinates, type: number, angle: number): void {
    }

    /**
     * Creates a parked car within the city.
     * @param line Line number of command.
     * @param reset Whether to keep the object when RESET happens.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param carType Car type.
     * @param angle Angle of the parked car.
     */
    private initParked(line: number, reset: boolean, coordinates: ICoordinates, carType: number, angle: number): Vehicle | null {
        return this.initParkedPixels(line, reset, { x: coordinates.x * 64 + 32, y: coordinates.y * 64 + 32, z: coordinates.z * 64 }, carType, angle);
    }

    /**
     * Creates a parked car within the city.
     * @param line Line number of command.
     * @param reset Whether to keep the object when RESET happens.
     * @param coordinates. Command coordinates in pixels. (0-16383)
     * @param carType Car type.
     * @param angle Angle of the parked car.
     */
    private initParkedPixels(line: number, reset: boolean, coordinates: ICoordinates, carType: number, angle: number): Vehicle | null {
        const info = this.game.style.getVehicleInfo(carType);
        if (info) {
            const vehicle = new Vehicle(/*coordinates.x, coordinates.y, coordinates.z, angle / 512 * Math.PI,*/ info);
            this.game.renderer.worldEntities.push(vehicle);
            this.game.vehicles.push(vehicle);
        //    const vehicle = new Vehicle(coordinates.x / 64, coordinates.y / 64, coordinates.z / 64, angle, info);
        //    this.game.addToWorld(vehicle);
            return vehicle;
        }

        return null;
    }

    /**
     * Unknown function. Used 39 times.
     * @param line Line number of command.
     * @param reset Always true.
     * @param coordinates. Command coordinates in pixels. (0-16383)
     * @param param1 Unknown parameter. Possible values: 0, 4, 5
     * @param param2 Unknown parameter. Could be angle. Possible values: 0, 256, 512, 768
     * @param param3 Unknown parameter. Possible values: 147, 145, 156, 154, 155, 172, 170, 171, 166, 167, 168, 158, 159, 160
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 5100, 5200, 5300, 5900, 6000, 6100, 470, 480, 490, 510, 520, 530, 550, 560, 570, 590, 600, 610
     */
    private initPed(line: number, reset: never, coordinates: ICoordinates, param1: number, param2: number, param3: number, param4?: number): void {
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param reset Always false.
     * @param coordinates. Not used.
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 1500, 1170
     * @param param2 Unknown parameter. Possible values: 165, 1020
     * @param param3 Unknown parameter. Could be init line reference. Possible values: 162, 1000
     */
    private initPedcarTrig(line: number, reset: never, coordinates: never, param1: number, param2: number, param3: number): void {
    }

    /**
     * Unknown function. Used 12 times.
     * @param line Line number of command.
     * @param reset Always true.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 192, 194, 81, 3540, 5840, 5940, 174, 600, 612, 220, 240, 260
     * @param param2 Unknown parameter. Possible values: 5, 4
     */
    private initPhoneTogg(line: number, reset: never, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Creates a player pedestrian who owns <car> where car is the line number of it.
     * @param line Line number of command.
     * @param reset Whether to keep the object when RESET happens.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param car Gived player an exclusive access to a vehicle.
     * @param angle Angle of the player.
     */
    private initPlayer(line: number, reset: boolean, coordinates: ICoordinates, car: number, angle: number): Character {
        return this.game.addPlayer(coordinates.x + .5, coordinates.y + .5, coordinates.z - .5, angle / 163);
    }

    /**
     * Unknown function. Used 2501 times.
     * @param line Line number of command.
     * @param reset Whether to keep the object when RESET happens.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param powerupType Unknown parameter. Possible values: 1 - Pistol, 2 - Machine Gun, 3 - Rocket Launcher, 4 - Flame thrower, 6 - Car Speed Up, 9 - Bribe, 10 - Armor, 11 - Multiplier Up, 12 - Get Out Of Jail Free, 13 - Extra Life, 14 - Info sign, 15 - Extra life
     * @param ammoOrInfoNumber If powerupType is Info Sign, tells what info is shown. Value 1 - 99 is ammo. Value > 99 starts a frenzy.
     */
    private initPowerup(line: number, reset: boolean, coordinates: ICoordinates, powerupType: number, ammoOrInfoNumber: number): void {
    }

    /**
     * Sets level secret mission count.
     * @param line Line number of command.
     * @param reset Whether to keep the object when RESET happens.
     * @param coordinates. Not used.
     * @param initialMissionCount Number of secret missions when level starts.
     * @param param2 Unknown parameter. Always 0
     */
    private initSecretMissionCounter(line: number, reset: boolean, coordinates: never, initialMissionCount: number, param2: number): void {
        const counter = new Counter(initialMissionCount);
        counter.valueChange = (newValue) => this.game.secretMissions = newValue;
        this.game.secretMissions = initialMissionCount;
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param reset Always true.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Always 3
     * @param param2 Unknown parameter. Always 0
     * @param param3 Unknown parameter. Always 4
     * @param param4 Unknown parameter. Always 212
     * @param param5 Unknown parameter. Always -1
     */
    private initSpecificBarr(line: number, reset: never, coordinates: ICoordinates, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Unknown function. Used 19 times.
     * @param line Line number of command.
     * @param reset Whether to keep the object when RESET happens.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param param1 Unknown parameter. Possible values: 2, 1, 3, 0
     * @param param2 Unknown parameter. Possible values: 4, 22
     * @param param3 Unknown parameter. Possible values: 0, 8
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 116, 118, 205, 136, 920, 6110, 244, 249, 250, 251, 252, 279, 243, 445, 463, 464, 1030, 14050, 15030
     * @param param5 Unknown parameter. Could be command line reference. Could be init line reference. Possible values: -1, 3
     */
    private initSpecificDoor(line: number, reset: boolean, coordinates: ICoordinates, param1: number, param2: number, param3: number, param4: number, param5: number): void {
    }

    /**
     * Creates a spray shop for <colour>.
     * @param line Line number of command.
     * @param reset Always true.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param color Color of spray. Possible values: 1, 2, 3, 4, 5, 6
     * @param radius Radius of shop.
     */
    private initSpray(line: number, reset: never, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Creates a target area used for explosions, destinations
     * @param line Line number of command.
     * @param reset Whether to keep the object when RESET happens.
     * @param coordinates. Command coordinates in pixels. (0-16383)
     * @param param1 Always 0
     * @param param2 Always 0
     */
    private initTarget(line: number, reset: boolean, coordinates: ICoordinates, param1: number, param2: number): void {
    }

    /**
     * Sets map target score.
     * @param line Line number of command.
     * @param reset Whether to keep the object when RESET happens.
     * @param coordinates. Not used.
     * @param targetScore Target score to obtain.
     * @param param2 Unknown parameter. Always 0
     */
    private initTargetScore(line: number, reset: boolean, coordinates: never, targetScore: number, param2: number): void {
        this.game.targetScore = targetScore;
    }

    /**
     * Creates a telephone at <angle>. 
     * @param line Line number of command.
     * @param reset Always true.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param means If <means> is greater than  0, then when the player is sent to answer this phone, how he got there will be checked - it isn’t used currently.
     * @param angle Angle of the telephone.
     */
    private initTelephone(line: number, reset: never, coordinates: ICoordinates, means: never, angle: number): void {
    }

    /**
     * Creates a trigger that will start <line> line of  Targets with  a radius of <range> blocks in a ‘square’ range.  A range of  0 means check just this block.
     * @param line Line number of command.
     * @param reset Whether to keep the object when RESET happens.
     * @param coordinates. Command coordinates in full tiles. (0-255)
     * @param triggerCommand Command that is run when player is in trigger area.
     * @param size Size of the trigger in full tiles.
     */
    private initTrigger(line: number, reset: boolean, coordinates: ICoordinates, triggerCommand: number, size: number): Trigger {
        const trigger = new Trigger(this.game, this.game.renderer, this.game.style, coordinates.x * 64, coordinates.y * 64, coordinates.z * 64, size * 64);
        this.game.triggers.push(trigger);
        trigger.addCallback(() => this.startThread(triggerCommand));
        return trigger;
    }

    /**
     * Unknown function. Used 24 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Always -1
     * @param param4 Unknown parameter. Always -1
     * @param param5 Unknown parameter. Always 0
     */
    private commandAddALife(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 47 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 72, 105, 86, 38, 16, 112, 121, 56, 32, 44, 60, 57, 42, 17, 18, 41, 61, 78, 59, 55, 52, 30, 63, 43, 64, 13, 37, 6, 90, 14, 79, 104, 33, 11, 34
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 420, 792, 1800, 4260, 4270, 4280, 4290, 31239, 31250, 146, 1883, 2640, 4050, 8050, 15100, 15180, 15260, 15340, 10050, 10150, 10250, 10350, 10450, 10550, 10650, 10750, 305, 7001, 7999, 8999, 12999, 1450, 1510, 1600, 23999, 24999, 25999, 26060, 26120
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 10, 30, 5
     * @param param5 Unknown parameter. Possible values: 2500, 0, 1500, 5000, 10000, 1000
     */
    private commandAnswer(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 4 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandArmedmess(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Sets mission guide arrow to a specific object.
     * @param line Line number of command.
     * @param targetId Object to point to.
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, 430, 447, 405, 940, 1425, 1432, 2490, 3480, 4500, 4510, 4530, 4540, 4550, -1, 970, 980, 2910, 2920, 2930, 6700, 6800, 7925, 7932, 8950, 9987, 9994, 16787, 16761, 16770, 16780, 17800, 18880, 18870, 19795, 19831, 19870, 31350
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Could be command line reference. Possible values: 0, 5000, 10000, 1000
     */
    private commandArrow(line: number | null, targetId: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Turns arrow off.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 0, 710, 720, 730
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, -1, 1450, 1297, 1850, 2676, 4340, 8403, 5000
     * @param param4 Unknown parameter. Always 0
     * @param points Number of points to give user.
     */
    private commandArrowOff(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Sets mission guide arrow to a specific car.
     * @param line Line number of command.
     * @param targetId Object to point to.
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Could be init line reference. Possible values: 0, 1000
     */
    private commandArrowcar(line: number | null, targetId: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 170 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 252, 237, 384, 385, 386, 387, 388, 267, 268, 150, 152, 227, 228, 199, 225, 295, 255, 395, 271, 687, 597, 598, 600, 632, 135, 131, 183, 184, 185, 186, 187, 188, 3750, 3760, 3770, 3780, 163, 3022, 3024, 3026, 3028, 247, 250, 169, 254, 139, 3300, 238, 240, 242, 246, 172, 11800, 11810, 370, 741, 980, 990, 1000, 1005, 950, 960, 970, 1210, 1230, 1250, 1270, 1274, 1460, 1410, 1615, 1686, 1810, 1830, 6160, 6170, 6180, 6190, 6200, 6210, 6220, 6230, 7100, 7110, 7120, 7130, 7140, 7150, 7160, 7170, 180, 213, 281, 492, 339, 341, 343, 366, 376, 377, 378, 379, 430, 431, 447, 462, 476, 477, 478, 480, 481, 482, 670, 680, 690, 700, 710, 1160, 1180, 3000, 3020, 4000, 4030, 4020, 4010, 5000, 5010, 5020, 5030, 5040, 5050, 5060, 5070, 5080, 5090, 6040, 6050, 6070, 6080, 6100, 6110, 6130, 6140, 7040, 10000, 10020, 10050, 10080, 10110, 11070, 11030, 11090, 14040
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, 440, 2342, 2390, 3470, 9980, 18860, 19860, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandArrowped(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 16 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 241, 208, 299, 161, 364
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandBankAlarmOff(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 5 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 241, 208, 299, 161, 364
     * @param param5 Unknown parameter. Always 0
     */
    private commandBankAlarmOn(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 13 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 253, 198, 244, 270, 373, 640, 136, -1, 279
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 241, 208, 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandBankRobbery(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Shows briefing message bottom of the screen. Icon is a phone?
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Always 0
     * @param textReference Text to be shown. Reference to translation file.
     */
    private commandBrief(line: number | null, param1: number, nextLine: number, param3: number, param4: number, textReference: number): number {
        this.game.showText(textReference, "phone");
        return nextLine;
    }

    /**
     * Unknown function. Used 117 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Possible values: 205, 712, 760, 1582, 4222, 4252, 4031, 4091, 4152, 4227, 31022, 31082, 31162, 178, 15690, 3160, 3310, 3440, 3570, 1437, 1727, 1755, 1784, 1816, 1725, 5535, 2245, 2580, 2173, 2172, 2041, 2110, 2155, 5823, 6890, 20900, 350, 8081, 1260, 1672, 1700, 5006, 7250, 16410, 17280, 18090, 21980
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandCancelBriefing(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 42 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 200, 152, 565, 373, 579, 640, 242, 225, 250, 950, 960, 970, 1272, 1280, 1290, 1300, 1610, 1730, 1740, 1750, 1760, 7175, 345, 346, 347, 408, 446, 459, 460, 5110, 5120, 9180, 11000, 11020, 11060, 11250, 11252, 11254, 11256, 11258, 11260, 13020
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandCarOn(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 26 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 229, 230, 231, 232, 233, 234, 11900, 1950, 7600, 7620, 7640, 7660, 7680, 8460, 8493, 760, 762, 764, 766, 768, 846, 853
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandChangeBlock(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 970 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 299, 300, 301, 302, 249, 233, 382, 383, 384, 385, 386, 387, 388, 237, 268, 267, 152, 227, 228, 226, 238, 225, 295, 323, 324, 325, 326, 256, 250, 345, 346, 347, 351, 146, 147, 148, 336, 597, 595, 596, 598, 604, 605, 606, 607, 608, 609, 601, 602, 632, 633, 631, 3055, 121, 124, 127, 181, 131, 183, 184, 185, 186, 187, 188, 3750, 3760, 3770, 3780, 3272, 3274, 165, 3080, 3070, 158, 159, 3022, 3024, 3026, 3028, 168, 169, 170, 11865, 254, 139, 140, 141, 142, 143, 257, 258, 259, 260, 261, 262, 263, 264, 3300, 241, 240, 242, 246, 172, 11800, 11810, 370, 380, 390, 400, 410, 420, 425, 310, 320, 330, 340, 350, 741, 947, 980, 950, 990, 960, 1000, 970, 1005, 1210, 1230, 1250, 1270, 1274, 1350, 1360, 1370, 1470, 1410, 1686, 1810, 1990, 1890, 1900, 1910, 1920, 1930, 1940, 6160, 6170, 6180, 6190, 6200, 6210, 6220, 6230, 7100, 7110, 7120, 7130, 7140, 7150, 7160, 7170, 7400, 7410, 7420, 7430, 7440, 7450, 180, 213, 5100, 5200, 5300, 5400, 5900, 6000, 6100, 492, 285, 286, 287, 339, 341, 343, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 367, 368, 366, 23633, 376, 377, 378, 379, 423, 424, 432, 433, 434, 435, 436, 437, 438, 439, 440, 441, 442, 443, 430, 431, 454, 453, 455, 456, 451, 458, 452, 457, 447, 448, 449, 462, 467, 468, 469, 470, 471, 472, 465, 466, 476, 477, 478, 480, 481, 482, 670, 680, 690, 700, 710, 1090, 1100, 1110, 1120, 1130, 1140, 1150, 20301, 20302, 20303, 20304, 20305, 20306, 490, 500, 510, 520, 530, 540, 550, 560, 570, 580, 590, 600, 610, 620, 1020, 1080, 2060, 2070, 2080, 2090, 2180, 3000, 3020, 4000, 4010, 4020, 4030, 5000, 5010, 5020, 5030, 5040, 5050, 5060, 5070, 5080, 5090, 5130, 5140, 5150, 5160, 5170, 5180, 5182, 5184, 6030, 6040, 6050, 6060, 6070, 6080, 6090, 6110, 6120, 6130, 6140, 6150, 7090, 7040, 7050, 7060, 7080, 9010, 9020, 9030, 9040, 9050, 10000, 10020, 10050, 10080, 10110, 11030, 11070, 11090, 12050, 12060, 12070, 12280, 12282, 12000, 12030, 12010, 12020, 13160, 13140, 13150, 13170, 13180, 15193, 18170, 18180, 18190, 18200, 18210, 18220, 18230
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Could be init line reference. Possible values: -1, 0, 1
     * @param param4 Unknown parameter. Possible values: 21, 22, 5, 24, 4, 7, 25, 8, 1, 0, 2, 26, 44, 6, 46, 10, 41, 23, 13, 12, 11, 45, 42
     * @param param5 Unknown parameter. Could be init line reference. Possible values: 294, 0, 255, 335, 597, 596, 605, 595, 604, 631, 632, -1, 120, 123, 126, 180, 85, 162, 168, 169, 3280, 140, 141, 142, 143, 240, 11810, 300, 310, 320, 330, 340, 350, 380, 390, 400, 410, 420, 425, 1200, 1220, 1240, 1260, 1410, 1830, 175, 209, 342, 445, 1050, 1030, 1000, 2000, 3020, 3000, 4040, 4050, 4070, 4060, 6040, 6030, 6070, 6060, 6100, 6090, 6130, 6120, 6160, 6150, 6050, 6080, 6110, 6140, 6170, 9180, 12000, 12010, 12020, 12050, 12060, 12070, 12030
     */
    private commandChangePedType(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 242 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 223, 224, 225, 226, 227, 228, 11910, 11920, 11930, 1960, 7700, 7720, 7740, 7760, 7780, 7800, 7820, 7840, 7860, 7880, 7900, 7920, 7940, 7960, 7980, 8480, 8492, 8490, 8494, 8495, 8496, 21000, 21001, 21002, 21003, 21004, 21005, 21006, 21007, 21008, 21009, 21010, 21011, 21012, 21013, 21014, 21015, 21016, 21017, 21018, 21019, 21020, 21021, 21022, 21023, 21024, 21025, 21026, 21027, 21028, 21029, 21030, 21031, 21032, 21033, 21034, 21035, 21036, 21037, 21038, 21039, 21040, 21041, 21042, 21043, 21044, 21045, 21046, 21047, 21048, 21049, 21050, 21051, 21052, 21053, 21054, 21056, 21057, 21058, 21059, 21060, 21061, 21062, 21063, 21064, 21065, 21066, 21067, 21068, 21069, 21070, 21071, 21072, 21073, 21074, 21075, 21076, 21077, 21078, 21079, 21080, 21081, 21082, 21083, 21084, 21085, 21086, 21087, 21088, 21089, 21090, 21091, 21092, 21093, 21094, 21095, 21096, 21097, 21098, 21099, 21100, 21101, 21102, 21103, 21104, 21105, 21106, 21107, 21108, 21109, 21110, 21111, 21112, 21113, 21114, 21115, 21116, 21117, 21118, 21119, 21120, 21121, 21122, 21123, 21124, 21125, 21126, 21127, 21128, 21129, 21130, 21131, 21132, 21133, 21134, 21135, 21136, 21137, 21138, 21139, 21140, 21141, 21142, 21143, 21144, 21145, 21146, 21147, 21148, 21149, 21150, 21151, 21152, 21153, 21154, 21155, 21156, 21157, 21158, 21159, 21160, 21161, 21162, 21163, 21164, 21165, 21166, 21167, 21168, 21169, 21170, 21171, 21172, 21173, 21174, 21175, 21176, 21177, 21178, 770, 772, 774, 776, 778, 780, 782, 784, 786, 788, 790, 792, 794, 796, 798, 848, 852, 850, 854, 855, 856
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandChangeType(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 59 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 189, 253, 221, 230, 238, 295, 196, 198, 297, 256, 244, 485, 502, 374, 265, 209, 152, 612, 333, 315, 327, 251, 348, 270, 273, 219, 565, 373, 593, 213, 628, 640, 139, 116, 118, 3000, 3010, 1375, 1000
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 492, 455, 400, 928, 1497, 0, 2420, 2357, 2138, 2361, 2400, 2960, 3410, 3300, 3315, 3920, 4420, 4520, 4405, 5200, 6800, 950, 920, 900, 2660, 2665, 2655, 4400, 6500, 6560, 6400, 7960, 7800, 7940, 8850, 8540, 9860, 9800, 9820, 9840, 10800, 16950, 16500, 16530, 18700, 18750, 19990, 19735, 19845, 19850, 19840, 31305, -1, 5584, 1137
     * @param param4 Unknown parameter. Could be command line reference. Could be init line reference. Possible values: -1, 3, 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandCheckCar(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 31 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 191, 224, 151, 227, 616, 615, 320, 276, 272, 280, 566, 570, 599, 603, 117, 129, 249, 1310, 1630, 178, 248, 256, 282, 461, 1200, 14060
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, 7400, -1, 9650
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandCloseDoor(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Takes the counter <counter> and compares it to the number <check>.
     * @param line Line number of command.
     * @param counterReference Counter reference.
     * @param nextLineIfTrue Next command line if counter and check are equals.
     * @param nextLineIfFalse Next command line if counter and check are not equals.
     * @param check Value to check counter against.
     * @param score Add to player score.
     */
    private commandCompare(line: number | null, counterReference: number, nextLineIfTrue: number, nextLineIfFalse: number, check: number, score: number): number {
        this.game.score += score;
        const reference = this.initReferences.get(counterReference);
        if (reference instanceof Counter) {
            return (reference.value === check) ? nextLineIfTrue : nextLineIfFalse;
        }

        // Didn't reference a counter object. Always jump to false branch.
        return nextLineIfFalse;
    }

    /**
     * Unknown function. Used 24 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 285, 287, 289, 291, 92, 94, 96, 98, 200, 202, 204, 206
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Always -1
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 286, 288, 290, 292, 93, 95, 97, 99, 201, 203, 205, 207
     * @param param5 Unknown parameter. Always 0
     */
    private commandCrane(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 90 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 294, 85, 209
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 6840, 9060, 9150, 9220, 9290, 9370, 9450, 10060, 10840, 12050, 12150, 12220, 12290, 12380, 12450, 13050, 16345, 17670, 17790, 5140, 1132, 1717, 2002, 2085, 930, 6610, 6635, 11013, 11113, 11242, 11342, 11414, 11514, 11614, 11714, 11814, 11914, 12012, 12112, 23740, 2450, 4875, 6270, 6862, 22770, 453, 900, 10190, 14000, 31563, 31603, 31643, 31683, 31723, 31803, 31843, 31923, 31963, 32223, 1710, 3590, 3597, 3620, 25701, 25711, 31763, 31883
     * @param param4 Unknown parameter. Possible values: -1, 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandDeadArrested(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Decrements the counter <counter> and if it reaches zero then it goes to <succ> otherwise it goes to <fail>.
     * @param line Line number of command.
     * @param counter Counter reference.
     * @param nextLineIfTrue Next command line if counter is zero.
     * @param nextLineIfFalse Next command line if counter is bigger than zero
     * @param param3 Unused parameter.
     * @param score Add to player score.
     */
    private commandDeccount(line: number | null, counter: number, nextLineIfTrue: number, nextLineIfFalse: number, param3: number, score: number): number {
        this.game.score += score;
        const reference = this.initReferences.get(counter);
        if (reference instanceof Counter) {
            reference.value -= 1;
            return (reference.value === 0) ? nextLineIfTrue : nextLineIfFalse;
        }

        // Didn't reference a counter object. Always jump to false branch.
        return nextLineIfFalse;
    }

    /**
     * Waits until player destroys a car.
     * @param line Line number of command.
     * @param carReference Reference to a car.
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: -1, 0, 2200
     * @param param4 Unknown parameter. Possible values: 0, 750
     * @param points Points to give the player.
     */
    private commandDestroy(line: number | null, carReference: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Disables a trigger.
     * @param line Line number of command.
     * @param triggerReference. Trigger reference to disable
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: -1, 100, 505, 1000, 1500, 0, 16000, 17000, 2000, 18000
     * @param param4 Unknown parameter.
     * @param param5 Unknown parameter.
     */
    private commandDisable(line: number | null, triggerReference: number, nextLine: number, param3: number, param4: number, param5: number): number {
        const reference = this.initReferences.get(triggerReference);
        if (reference instanceof Trigger) {
            reference.disabled = true;
        } else {
            console.error(`Command ${triggerReference} is not a trigger.`);
        }

        return nextLine;
    }

    /**
     * Unknown function. Used 3 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandDisarmmess(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 3 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 270, 263, 202
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Possible values: 20000, 0
     */
    private commandDoGta(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 12 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 17120, 11220, 11320, 23100, 29944, 31044, 31144, 32444, 32544, 32644
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, 11244, 11344, 29994, 31094, 31194, 32494, 32594, 32694
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 579, -1
     * @param param5 Unknown parameter. Could be command line reference. Possible values: 2000, 0
     */
    private commandDoModel(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 189, 253
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Possible values: 200, 400
     * @param param5 Unknown parameter. Possible values: 15000, 20000
     */
    private commandDoRepo(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Seems to stop command processing.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandDonowt(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return -1;
    }

    /**
     * Unknown function. Used 54 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 191, 224, 227, 177, 267, 616, 254, 272, 276, 566, 599, 603, 630, 117, 119, 206, 207, 214, 215, 7300, 394, 248, 253, 255, 256, 282, 461, 473, 474, 1200, 23102, 23103, 14060, 15060, 23101, 23104, 23105, 23106, 23107, 23108, 23109, 23110, 23111, 23112
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be text reference. Could be command line reference. Possible values: 0, 2635, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandDoorOff(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 101 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 191, 254, 224, 151, 229, 201, 245, 175, 177, 179, 181, 183, 185, 187, 227, 192, 267, 570, 616, 615, 318, 320, 272, 276, 566, 568, 599, 603, 630, 637, 154, 155, 156, 157, 158, 159, 421, 422, 423, 424, 141, 101, 103, 105, 107, 109, 111, 113, 129, 9450, 9460, 206, 207, 209, 214, 215, 9405, 9410, 3400, 3410, 3420, 3430, 3440, 3450, 3460, 7800, 7810, 7820, 7830, 7840, 7850, 7860, 2512, 2513, 2514, 2515, 6240, 7300
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, 32000, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandDoorOn(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 3 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 240, 198, 241
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandDropOn(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 114 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Possible values: 0, -1
     * @param param5 Unknown parameter. Always 0
     */
    private commandDropWantedLevel(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 14 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 120, 123, 126, 180, 162, 3280, 1200, 1220, 1240, 1260, 1410, 175, 340, 342
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandDummyDriveOn(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 55 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 200, 215, 319, 277, 373, 579, 593, 242, 136, 131, 3720, 212, 238, 225, 250, 920, 950, 960, 970, 1272, 1380, 1610, 1730, 1740, 1750, 1760, 7392, 7393, 7394, 7395, 175, 251, 252, 483, 350, 351, 365, 1000, 1160, 2000, 7000, 11250, 11252, 11254, 11256, 11258, 11260, 13000, 13010, 13030, 13040, 14010, 15010
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandDummyon(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Disables a trigger.
     * @param line Line number of command.
     * @param triggerReference. Trigger reference to disable
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, -1, 545, 8000, 476, 898, 1458, 1899, 2351, 2947, 3334, 3882, 4398, 5171, 6225, 16750, 17287, 2687, 18590, 812, 4347, 6361, 7943, 8397, 9698, 10241, 19824
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Could be command line reference. Possible values: 0, 10000
     */
    private commandEnable(line: number | null, triggerReference: number, nextLine: number, param3: number, param4: number, param5: number): number {
        const reference = this.initReferences.get(triggerReference);
        if (reference instanceof Trigger) {
            reference.disabled = false;
        } else {
            console.error(`Command ${triggerReference} is not a trigger.`);
        }

        return nextLine;
    }

    /**
     * Unknown function. Used 7 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Possible values: 1, 2
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Possible values: 1, 0
     * @param param5 Unknown parameter. Possible values: 50000, 0
     */
    private commandEnd(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 23 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 156, 157, 154, 155, 152, 153, 218, 268, 219, 220, 221, 222, 1620, 1621, 1622, 1623, 1624, 1625, 1626, 1640, 1645, 1650, 1655
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Possible values: 1, 3, 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandExplNoFire(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 12 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 85, 3810, 2010, 8010, 8550, 7190, 7200
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandExplPed(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 45 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 129, 343, 312, 314, 344, 346, 318, 349, 351, 359, 320, 329, 354, 358, 362, 375, 377, 133, 130, 131, 268, 264, 128, 328, 571, 243, 244, 2050, 2060, 2070, 2080, 2090, 2100, 2110, 2120, 2130, 2140, 2150
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, -1, 7540
     * @param param4 Unknown parameter. Possible values: 0, 3, 2, 1
     * @param param5 Unknown parameter. Possible values: 0, 5000, 50000, 30000
     */
    private commandExplode(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 21 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 265, 612, 190, 191, 192, 193, 162, 148, 149, 150, 151, 700, 710, 720, 730, 1000, 8000, 14010
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Possible values: 0, 20000
     */
    private commandExplodeCar(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 319, 277
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Always -1
     * @param param5 Unknown parameter. Always 0
     */
    private commandFreeupCar(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 7 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandFreezeEnter(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 7 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 25, 200, 100, 30
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandFreezeTimed(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 140 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Possible values: 16, 24, 0
     * @param textReference: Text reference.
     */
    private commandFrenzyBrief(line: number | null, param1: number, nextLine: number, param3: number, param4: number, textReference: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 70 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Possible values: 1000, 3000, 5000, 10000, 15000, 25000, 9000, 30000, 150000, 35000, 50000, 70000, 90000, 210000
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 9030, 9110, 9190, 9270, 9350, 9430, 10030, 12030, 12110, 12190, 12270, 12350, 12430, 13030, 11006, 11106, 11240, 11340, 11412, 11512, 11612, 11712, 11812, 11912, 12006, 12106, 645, 785, 29948, 31048, 31148, 31557, 31597, 31637, 31677, 31717, 31797, 31837, 31917, 31957, 32217, 745, 31757, 31877, 32448, 32548, 32648
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Possible values: 20000, 30000, 0
     */
    private commandFrenzyCheck(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 70 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 9030, 9110, 9190, 9270, 9350, 9430, 10030, 12030, 12110, 12190, 12270, 12350, 12430, 13030, 11006, 11106, 11240, 11340, 11412, 11512, 11612, 11712, 11812, 11912, 12006, 12106, 645, 785, 29948, 31048, 31148, 31557, 31597, 31637, 31677, 31717, 31797, 31837, 31917, 31957, 32217, 745, 31757, 31877, 32448, 32548, 32648
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Possible values: 0, -1
     * @param param5 Unknown parameter. Always 0
     */
    private commandFrenzySet(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 247 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 137, 252, 299, 300, 301, 302, 249, 237, 382, 383, 38, 16, 145, 622, 345, 346, 347, 350, 351, 352, 146, 147, 148, 335, 336, 3022, 3024, 3026, 3028, 139, 240, 3821, 3820, 741, 1435, 1380, 1570, 1610, 7100, 7110, 7120, 7130, 7140, 7150, 7160, 7170, 7410, 7871, 7870, 5100, 5200, 5300, 5400, 5900, 6000, 6100, 6200, 492, 285, 286, 287, 423, 424, 430, 447, 448, 449, 451, 452, 453, 454, 455, 456, 457, 458, 1000, 20301, 20302, 20303, 20304, 20305, 20306, 4, 0, 67, 470, 480, 490, 500, 510, 520, 530, 540, 550, 560, 570, 580, 590, 600, 610, 620, 1020, 2000, 3000, 4000, 4010, 4020, 4030, 5130, 5140, 5150, 5160, 5170, 5180, 5182, 5184, 6040, 6050, 6070, 6080, 6110, 6130, 6140, 6160, 6170, 7000, 7050, 7060, 7080, 7090, 10020, 10050, 10080, 10110, 11251, 11253, 11255, 11257, 11259, 11261, 13000, 13010, 13020, 13030, 13040, 18170, 18180, 18190, 18200, 18210, 18220, 18230
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 14, 406, 0, 906, 1485, 1433, 1911, 6901, 13, 2696, 7520, 16789, 17802, 18882, 20002, 1980, 1982, 1984, 1986, 820, 6225, 6390, 15012, 25010, 2180, 5860, 6482, 6782, 20030, 20130, 20230, 20330, 20430, 20530, 20630, 20730, 22550, 27008, 29657, 2721, 2720, 2727, 2726, 2733, 2732, -1, 9400, 27241, 27441, 27641, 1143, 3570, 7283, 7383, 7483, 7583, 9744, 9749, 9754, 9759, 9764, 9769, 9774, 9779, 15165, 15175, 15185, 15195, 15205, 15215, 15225, 15235, 15245, 15255, 16202, 16944, 16949, 16954, 16959, 16964, 16969, 16974, 16979, 16984, 16989, 16994, 16999, 19227, 19417, 19617, 19807, 23100, 23140, 23180, 23220, 23260
     * @param param4 Unknown parameter. Possible values: 0, -1
     * @param param5 Unknown parameter. Could be command line reference. Possible values: 0, 10000, 1000
     */
    private commandGeneralOnscreen(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Reads car of a oedestrian and stores reference to a dummy object.
     * @param line Line number of command.
     * @param ped Reference to a character.
     * @param nextLineIfTrue Next command line when character and dummy references are set.
     * @param nextLineIfFalse Next command line when character or dummy reference are not set.
     * @param dummy Reference to a dummy object.
     * @param score Add to player score.
     */
    private commandGetCarInfo(line: number | null, ped: number, nextLineIfTrue: number, nextLineIfFalse: number, dummy: number, score: number): number {
        const pedReference = this.initReferences.get(ped);
        const dummyReference = this.initReferences.get(dummy);
        if ((pedReference instanceof Character) && (dummyReference instanceof Dummy)) {
            this.game.score += score;
            dummyReference.value = pedReference.vehicle;
            return nextLineIfTrue;
        }

        console.error("GET_DRIVER_INFO: parameter car should point to a vehicle and dummy to a dummy.");
        return nextLineIfFalse;
    }

    /**
     * Reads driver of a car and stores reference to a dummy object.
     * @param line Line number of command.
     * @param car Reference to a vehicle.
     * @param nextLineIfTrue Next command line when car and dummy references are set.
     * @param nextLineIfFalse Next command line when car or dummy reference are not set.
     * @param dummy Reference to a dummy object.
     * @param score Add to player score.
     */
    private commandGetDriverInfo(line: number | null, car: number, nextLineIfTrue: number, nextLineIfFalse: number, dummy: number, score: number): number {
        const carReference = this.initReferences.get(car);
        const dummyReference = this.initReferences.get(dummy);
        if ((carReference instanceof Vehicle) && (dummyReference instanceof Dummy)) {
            this.game.score += score;
            dummyReference.value = carReference.driver;
            return nextLineIfTrue;
        }

        console.error("GET_DRIVER_INFO: parameter car should point to a vehicle and dummy to a dummy.");
        return nextLineIfFalse;
    }

    /**
     * Unknown function. Used 33 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 119, 129, 200, 201, 202, 203, 209, 246, 173, 10010, 10000, 10040, 10060, 1465, 6240, 178, 394, 248, 253, 254, 255, 256, 282, 461, 473, 474, 1200, 14060, 15060
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: -1, 3220, 3221, 3222, 3223, 0, 2490, 29041, 29091, 29160, 29260, 5851, 36041, 36091, 36160, 36260
     * @param param4 Unknown parameter. Possible values: 0, 1500, 2250, 3000, 100, 50
     * @param param5 Unknown parameter. Could be init line reference. Possible values: 0, 64
     */
    private commandGoto(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 3 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 240, 198, 241
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 810, 4300, 31270
     * @param param4 Unknown parameter. Always 56
     * @param param5 Unknown parameter. Possible values: 50000, 0, 40000
     */
    private commandGotoDropoff(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 9 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 221, 222, 223, 316, 317, 240, 241, 242, 243
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandHellOn(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 3 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Possible values: 350, 351, 14010
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandHuntoff(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 3 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Possible values: 350, 351, 14010
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Always 1
     * @param param4 Unknown parameter. Always 209
     * @param param5 Unknown parameter. Always 0
     */
    private commandHunton(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 22 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Possible values: 2, 1, 4
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, 1622
     * @param param4 Unknown parameter. Possible values: -1, 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandIncHeads(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Increments the given counter in line <counter> by 1. After it does this, it checks to see if the counter is great than or equal to the <check> number.
     * @param line Line number of command.
     * @param counter Counter reference.
     * @param nextLineIfTrue Next command line if .
     * @param nextLineIfFalse Next command line
     * @param check Value to check against. Set to -1 if check should be skipped.
     * @param score Add to player score.
     */
    private commandInccount(line: number | null, counter: number, nextLineIfTrue: number, nextLineIfFalse: number, check: number, score: number): number {
        this.game.score += score;
        const reference = this.initReferences.get(counter);
        if (reference instanceof Counter) {
            reference.value += 1;
            return ((check === -1) || (reference.value >= check)) ? nextLineIfTrue : nextLineIfFalse;
        }

        // Didn't reference a counter object. Always jump to false branch.
        return nextLineIfFalse;
    }

    /**
     * Unknown function. Used 925 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Possible values: 189, 294, 252, 253, 299, 300, 301, 302, 249, 221, 233, 237, 384, 385, 386, 387, 388, 383, 382, 230, 267, 268, 150, 152, 238, 228, 227, 198, 199, 297, 244, 485, 304, 256, 295, 226, 225, 265, 332, 612, 622, 319, 323, 324, 325, 326, 315, 327, 345, 346, 347, 350, 351, 352, 250, 255, 146, 147, 148, 395, 277, 270, 271, 273, 335, 336, 373, 565, 339, 578, 687, 598, 595, 596, 593, 600, 628, 640, 632, 196, 251, 209, 213, 139, 3810, 183, 184, 185, 186, 187, 188, 85, 3750, 3760, 3770, 3780, 3070, 3080, 3022, 3024, 3026, 3028, 240, 11810, 11800, 200, 205, 210, 215, 220, 8010, 370, 380, 390, 400, 410, 420, 425, 310, 320, 330, 340, 1200, 1210, 1220, 1230, 1240, 1250, 1260, 1270, 1350, 1360, 1370, 1302, 1303, 1304, 1305, 1306, 1307, 1308, 1309, 6110, 6160, 6170, 6180, 6190, 6200, 6210, 6220, 6230, 6120, 6130, 6140, 6150, 7400, 7410, 7420, 7430, 7440, 7450, 180, 5400, 5300, 5200, 5100, 6100, 6000, 5900, 3000, 8020, 241, 285, 286, 287, 341, 343, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 376, 377, 378, 379, 423, 424, 430, 447, 448, 449, 451, 452, 453, 454, 455, 456, 457, 458, 462, 8550, 465, 466, 467, 468, 469, 470, 471, 472, 476, 477, 478, 480, 481, 482, 670, 680, 690, 700, 710, 20301, 20302, 20303, 20304, 20305, 20306, 18740, 18700, 18720, 23400, 500, 490, 540, 530, 520, 510, 580, 570, 560, 550, 620, 610, 590, 802, 2060, 2070, 2080, 2090, 3020, 4000, 4050, 4070, 4060, 4010, 4040, 4020, 4030, 5000, 5010, 5020, 5030, 5040, 5050, 5060, 5070, 5080, 5090, 5130, 5140, 5150, 5160, 5170, 5180, 5182, 5184, 6040, 6050, 6070, 6080, 6030, 6060, 6090, 7040, 7050, 7060, 7080, 7090, 7100, 7110, 7120, 7130, 7140, 7150, 7160, 7170, 9010, 9020, 9030, 9040, 9050, 11000, 11070, 11020, 11030, 11060, 11090, 12000, 12030, 12010, 12020, 12050, 12060, 12070, 12040, 13000, 13010, 13020, 13030, 13040, 18170, 18180, 18190, 18200, 18210, 18220, 18230
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 150, 250, 484, 494, 0, 930, 950, 970, 980, 1296, 1301, 1304, 1307, 1310, 1313, 1316, 1380, 1410, 1465, 1471, 1491, 1720, 2370, 2380, 2430, 2450, 2470, 3350, 3420, 3440, 3460, 3900, 4430, 5250, 8925, 28005, 28205, 28405, 28605, 29016, 29036, 29056, 29076, 29216, 29236, 29256, 29276, 29416, 29436, 29456, 29476, 29616, 29636, 29656, 29676, 941, 960, 2710, 2800, 6520, 6530, 6650, 7350, 7900, 7962, 7970, 7980, 8860, 8890, 9260, 9620, 9640, 9890, 9915, 9940, 9970, 10860, 16550, 16802, 16930, 16965, 16990, 17400, 17500, 17900, 18770, 18800, 18830, 19710, 19750, 19775, 19785, 19940, 19980, 31320, 217, 15622, 16031, 496, 521, 3006, 3010, 3672, 17730, 17732, 17734, 17736, 17770, 17771, 17772, 17773, 17800, 17804, 17808, 17812, 17523, 5116, 1553, 1218, 1270, 1272, 1990, 1993, 1996, 1999, 1946, 7056, 2082, 5891, 926, 6405, 6561, 2526, 23560, 23620, 23672, 23680, 23860, 946, 990, 1110, 1305, 1309, 1311, 1315, 1591, 1740, 1770, 1800, 1830, 1860, 1890, 1950, 2251, 3175, 3301, 3906, 4250, 4710, 4715, 4720, 4725, 4730, 4735, 4740, 4745, 4966, 5535, 5710, 5715, 5720, 5725, 5730, 5731, 5732, 5733, 5734, 5735, 5736, 5761, 6361, 6656, 6780, 7121, 18070, 18240, 18470, 19020, 19200, 19000, 19222, 19312, 19322, 19332, 19342, 19352, 19362, 19372, 19382, 19450, 19462, 19472, 19482, 19492, 19566, 20800, 21051, 22311, 22485, 22490, 22500, 22510, 22520, 22530, 22766, 23441, 457, 510, 515, 520, 564, 570, 576, 650, 790, 940, 942, 943, 944, 945, 947, 1460, 2507, 3580, 3901, 3902, 3903, 3904, 3905, 3907, 3908, 3909, 3937, 3941, 3962, 5410, 9503, 9510, 9550, 10375, 10376, 10377, 10378, 10379, 10380, 10381, 10382, 10488, 10610, 10611, 10612, 10613, 10614, 10615, 10616, 10617, 11312, 11642, 11643, 11644, 11645, 11646, 12500, 12525, 12545, 15004, 29953, 31053, 31153, 480, 486, 492, 508, 514, 536, 542, 548, 750, 981, 982, 983, 984, 985, 986, 987, 988, 989, 991, 992, 993, 994, 995, 3511, 4010, 4110, 4210, 4310, 7890, 7903, 7910, 7913, 7920, 7923, 9111, 9291, 9292, 9293, 9294, 9295, 9296, 9297, 9298, 9299, 9300, 9798, 9812, 9912, 10391, 10392, 10393, 10394, 10395, 10396, 10397, 10398, 10399, 10400, 15010, 15030, 15040, 15050, 15052, 15382, 15385, 15388, 15391, 15394, 15397, 15400, 15403, 15406, 15409, 15796, 15820, 15920, 16390, 16402, 16798, 16804, 16904, 18160, 18180, 18200, 18220, 18468, 18490, 18492, 18524, 18550, 18560, 18562, 18631, 18632, 18633, 18634, 18635, 18697, 18718, 18818, 21235, 21277, 21350, 21410, 21590, 21770, 21800, 21801, 21802, 21803, 21804, 21805, 22190, 22191, 22196, 22197, 22370, 22371, 22372, 22373, 22450, 22452, 22454, 22470, 22492, 22494, 22496, 22513, 22698, 22703, 22803, 23720, 23730, 23740, 23750, 23760, 23898, 23907, 23957, 31403, 32453, 32553, 32653
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 0, -1, 85, 11800
     * @param param5 Unknown parameter. Possible values: 0, 50000, 30000, 40000, 1000
     */
    private commandIsGoalDead(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 27 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 294, 85, 209
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 235, 1360, 3340, 5260, 2730, 6505, 9250, 16980, 17700, 19930, 5330, 1440, 4270, 6660, 21100, 2513, 3958, 5400, 9544, 10730, 12530, 9898, 15896, 16898, 18798, 22798, 23948
     * @param param4 Unknown parameter. Possible values: -1, 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandIsPedArrested(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 223 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 294, 252, 150, 152, 199, 271, 339, 600, 632, 85, 135, 165, 247, 1470, 180, 209, 281, 341, 366, 1050, 7040, 14040, 16050
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: -1, 340, 0, 1048, 1060, 2090, 2138, 2221, 2250, 2492, 3170, 4080, 325, 580, 2525, 5300, 7465, 9142, 16380, 18300, 18422, 19110, 19405, 19570, 19581, 19655, 633, 5010, 1491, 1021, 1748, 1775, 1808, 6801, 6872, 11015, 11115, 12014, 12114, 23800, 5960, 21501, 21710, 21910, 22110, 260, 2478, 2482, 3344, 3404, 4055, 5054, 8430, 10185, 13406, 1137, 16462, 19050, 24070, 24083, 24183, 26250
     * @param param4 Unknown parameter. Possible values: -1, 0, 4, 22, 5, 42, 7, 37, 3, 74, 6, 87, 82, 26, 78, 44, 35, 77, 46, 45, 65, 83, 43
     * @param param5 Unknown parameter. Possible values: 0, 5000, 10000, 15000, 1000
     */
    private commandIsPedInCar(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 14 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 3750, 3760, 3770, 3780, 1686, 10020, 10050, 10080, 10110
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 17722, 17724, 17726, 17728, 17802, 17806, 17810, 17814, 6852, 20068, 20098, 20148, 20187, 20191
     * @param param4 Unknown parameter. Possible values: 0, -1
     * @param param5 Unknown parameter. Always 0
     */
    private commandIsPedStunned(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Checks if player is in a train. If so, trains reference is saved to a dummy variable.
     * @param line Line number of command.
     * @param train Unknown parameter. Could be init line reference. Possible values: 506, 223
     * @param nextLineIfTrue Next command line.
     * @param nextLineIfFalse Unknown parameter. Could be command line reference. Possible values: 6120, 10120, 10860
     * @param param4 Always 0
     * @param score Add to player score.
     */
    private commandIsPlayerOnTrain(line: number | null, train: number, nextLineIfTrue: number, nextLineIfFalse: number, param4: number, score: number): number {
        const trainReference = this.initReferences.get(train);
        const playerVehicle = this.game.player?.vehicle;
        if ((!this.game.trainSystem.isWrecked) && playerVehicle && (playerVehicle.info.type === "train")) {
            if (trainReference instanceof Dummy) {
                this.game.score += score;
                trainReference.value = playerVehicle;
                return nextLineIfTrue;
            }
        }

        return nextLineIfFalse;
    }

    /**
     * Unknown function. Used 1650 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 271, 272, 492, 493, 494, 495, 496, 276, 277, 278, 279, 280, 557, 558, 559, 560, 561, 562, 309, 357, 358, 359, 360, 361, 310, 663, 664, 665, 666, 667, 668, 669, 670, 671, 672, 673, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 273, 274, 275, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 2610, 2630, 2650, 2670, 2690, 2710, 9050, 9060, 9070, 9080, 9090, 9100, 9110, 9120, 9130, 9140, 9150, 9160, 9170, 9180, 2525, 9001, 9002, 9003, 9004, 9005, 9006, 9007, 9008, 9009, 9010, 9011, 9012, 9013, 9014, 9015, 9016, 9017, 9018, 9019, 9020, 9021, 9030, 9031, 9032, 9033, 9034, 9035, 9037, 9038, 9039, 9051, 9052, 9053, 9054, 9055, 9056, 9057, 9058, 9059, 9061, 9062, 9063, 9064, 9065, 9066, 9067, 9068, 9069, 9071, 9072, 9073, 9074, 9075, 9076, 9077, 9078, 9079, 9081, 9082, 9083, 9084, 19000, 19001, 19002, 19003, 19004, 19005, 19006, 19007, 19008, 19009, 19010, 19011, 19012, 19013, 19014, 19015, 19016, 19017, 19018, 19019, 19020, 19021, 19022, 19023, 19024, 19025, 19030, 19031, 19032, 19033, 19034, 19035, 19036, 19037, 19038, 19039, 19040, 19041, 19050, 19051, 19052, 19053, 19054, 19055, 19056, 19057, 19058, 19059, 19060, 19061, 19062, 19063, 19064, 19065, 19066, 19067, 19068, 19069, 19070, 19071, 19072, 19073, 19074, 19075, 19076, 19077, 19078, 19079, 19080, 19081, 19082, 19084, 23013, 23014, 23500, 23501, 23502, 23503, 23504, 23505, 23506, 23507, 23508, 23509, 23510, 23511, 23512, 23012, 23010, 23011, 23000, 23001, 23002, 23003, 23004, 23005, 9036, 23006, 23007, 23008, 23009, 23015, 23016, 19083
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 9025, 9100, 9180, 9260, 9340, 9420, 10020, 31604, 31614, 31624, 31634, 31644, 31654, 31664, 31674, 31684, 31694, 31704, 12020, 12100, 12180, 12260, 12340, 12420, 13420, 104, 114, 124, 134, 144, 154, 164, 174, 184, 194, 204, 214, 224, 234, 244, 254, 264, 274, 284, 294, 304, 314, 324, 334, 344, 354, 364, 374, 384, 404, 414, 424, 434, 444, 454, 464, 474, 484, 494, 504, 514, 524, 534, 544, 554, 564, 574, 584, 594, 604, 614, 624, 634, 644, 654, 664, 674, 684, 694, 704, 714, 724, 734, 744, 754, 764, 774, 784, 794, 804, 814, 824, 834, 844, 854, 864, 874, 884, 894, 904, 914, 924, 934, 944, 954, 964, 974, 984, 994, 1004, 1014, 1024, 1034, 1044, 1054, 1064, 1074, 1084, 1040, 1140, 1240, 1340, 1440, 1540, 1640, 1740, 1840, 1940, 2040, 2140, 2240, 2340, 2440, 2540, 2640, 2740, 2840, 2940, 3040, 3140, 3240, 3340, 3440, 3540, 3640, 3740, 3840, 4040, 4140, 4240, 4340, 4440, 4540, 4640, 4740, 4840, 4940, 5040, 5140, 5240, 5340, 5440, 5540, 5640, 5740, 5840, 5940, 6040, 6140, 6240, 6340, 6440, 6540, 6640, 6740, 6840, 6940, 7040, 7140, 7240, 7340, 7440, 7540, 7640, 7740, 7840, 7940, 8040, 8140, 8240, 8340, 8440, 8540, 8640, 8740, 8840, 8940, 9040, 9140, 9240, 9440, 9540, 9640, 9740, 9840, 9940, 10040, 10140, 10240, 10340, 10440, 10540, 10640, 10740, 10840, 11411, 11511, 11611, 11711, 11811, 11911, 27050, 27110, 27170, 27230, 27290, 27350, 27410, 27470, 27530, 27590, 27650, 27710, 27770, 27830, 225, 10910, 30050, 30110, 30170, 30230, 30290, 30350, 30410, 30470, 30530, 30590, 30650, 30710, 30770, 30830, 2006, 2016, 2026, 2036, 2046, 2056, 2066, 2076, 2086, 2096, 2106, 2116, 2126, 2136, 2146, 2156, 2166, 2176, 2186, 2196, 2206, 2216, 2226, 2236, 2246, 2256, 2266, 2286, 2296, 2306, 2316, 2326, 2336, 2346, 2356, 2366, 2376, 2386, 2396, 2406, 2416, 2426, 2436, 2446, 2456, 2466, 2476, 2486, 2496, 2506, 2516, 2526, 2536, 2546, 2556, 2566, 2576, 2586, 2596, 2606, 2616, 2626, 2636, 2646, 2656, 2666, 2676, 2686, 2696, 2706, 2716, 2726, 2736, 2746, 2756, 2766, 2776, 2786, 2796, 2806, 2816, 2826, 2836, 2846, 2856, 2866, 2876, 2886, 2896, 2906, 2916, 2926, 2936, 2946, 2956, 2966, 2976, 2986, 2996, 3006, 3016, 3026, 3036, 3046, 3056, 3066, 3076, 3086, 3096, 3106, 3116, 3126, 3136, 3146, 3156, 3166, 3176, 3186, 3196, 3206, 3216, 3226, 3236, 3246, 3256, 3266, 3276, 3286, 3296, 3306, 3316, 3326, 3336, 3346, 3356, 3366, 3386, -1, 20005, 20015, 20025, 20035, 20045, 20055, 20065, 20075, 20085, 20095, 20105, 20115, 20125, 31562, 31602, 31642, 31682, 31722, 31802, 31842, 31922, 31962, 32222, 2005, 2015, 2025, 2035, 2045, 2055, 2065, 2075, 2085, 2095, 2105, 2115, 2125, 31762, 31882, 2276, 3376
     * @param param4 Unknown parameter. Possible values: 200, 75, 0, 2250, 2750, 3125, 2375, 2625, 1750, 2000, 2500, 2125, 3250
     * @param param5 Unknown parameter. Could be init line reference. Possible values: 0, 32
     */
    private commandIsPowerupDone(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 113 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Possible values: 0, -1
     * @param param5 Unknown parameter. Always 0
     */
    private commandKeepThisProc(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 32 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 90, 110, 125, 95, 105, 70, 80, 100, 85, 130
     * @param param5 Unknown parameter. Always 3502
     */
    private commandKfBriefGeneral(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 22 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 120, 100, 80
     * @param param5 Unknown parameter. Could be text reference. Possible values: 2502, 3502
     */
    private commandKfBriefTimed(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 54 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 11007, 11107, 11260, 11360, 12007, 12107, 646, 786, 29949, 31049, 31149, 746, 32449, 32549, 32649
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandKfCancelBriefing(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 32 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 665, 805, 29971, 31071, 31171, 31579, 31619, 31659, 31699, 31739, 31819, 31859, 31939, 31979, 32239, 765, 31779, 31899, 32471, 32571, 32671
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandKfCancelGeneral(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 102 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Always -1
     * @param param4 Unknown parameter. Always -1
     * @param param5 Unknown parameter. Always 0
     */
    private commandKfProcess(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Runs another command.
     * @param line Line number of command.
     * @param commandLineNumber Command to run
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be text reference. Could be command line reference. Possible values: -1, 1301, 0
     * @param param4 Unknown parameter. Could be command line reference. Possible values: 0, -1, 10452
     * @param param5 Unknown parameter.
     */
    private commandKickstart(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        this.startThread(param1);
        return nextLine;
    }

    /**
     * Unknown function. Used 6 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 485, 265, 200, 242, 213, 2000
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 5170, -1, 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandKillCar(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 4 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 240, 241
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandKillDrop(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Kills an object.
     * @param line Line number of command.
     * @param objectToKill Reference to object to be killed.
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Could be command line reference. Possible values: 0, 1000
     */
    private commandKillObj(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 54 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 252, 299, 300, 301, 302, 249, 233, 237, 382, 383, 345, 346, 347, 350, 351, 352, 146, 147, 148, 395, 335, 336, 163, 1460, 1810, 1830, 5100, 5200, 5300, 5400, 5900, 6000, 6100, 6200, 492, 1160, 1180, 470, 480, 490, 500, 510, 520, 530, 540, 550, 560, 570, 580, 590, 600, 610, 620
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandKillPed(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 9 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 327, 341, 479, 363, 17717
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Possible values: -1, 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandKillProcess(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 179 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 32001, 113, 107, 361, 282, 316, 322, 346, 345, 562, 605, 560, 775, 785, 1035, 1007, 1060, 1218, 1263, 1333, 1334, 1331, 1332, 2025, 2048, 2009, 2125, 2185, 2205, 2105, 2278, 2270, 2535, 3102, 3105, 3045, 3183, 3185, 3186, 3187, 3515, 4055, 4103, 4217, 4247, 4277, 4032, 5013, 5014, 6065, 6070, 8116, 31304, 437, 415, 518, 2042, 2235, 2415, 2505, 2015, 6040, 6058, 6033, 6247, 6175, 7036, 7035, 7085, 7228, 7308, 7427, 7425, 8035, 8095, 8231, 8262, 8264, 9108, 9106, 9045, 9175, 9149, 9150, 9151, 9328, 9375, 9526, 9593, 10065, 10070, 16036, 16015, 16111, 16325, 16324, 16180, 16398, 16399, 16395, 17012, 17154, 17036, 17037, 18278, 18267, 18255, 18445, 18431, 18140, 18145, 19085, 19045, 19130, 19559, 19475, 19505, 19593, 19591, 31223, 31217
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, -1, 822, 4273, 9690
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandKillSideProc(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 418 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 1333, 1334, 1218, 1007, 1263, 2205, 2009, 2105, 3185, 3515, 4032, 5013, 5014, 6070, 8116, 415, 2561, 6247, 7035, 7425, 8035, 8231, 9150, 9151, 9045, 9149, 9108, 9328, 10070, 16399, 16111, 19045, 19475, 19591, 19545, 25015, 156, 15440, 152, 235, 237, 254, 233, 259, 616, 609, 610, 622, 637, 638, 575, 3132, 3174, 3282, 3334, 3412, 3464, 3542, 3594, 17711, 17712, 17713, 17714, 17652, 5002, 5021, 5130, 5017, 5019, 5032, 5030, 1320, 1318, 1408, 1427, 1428, 1436, 1447, 1452, 1476, 1024, 1025, 1034, 1740, 1770, 1804, 1742, 1713, 1702, 1745, 1767, 1800, 6803, 6832, 6804, 6882, 6883, 5589, 5552, 5511, 822, 6392, 6472, 6495, 2215, 15013, 23641, 1108, 1295, 3150, 3112, 3441, 5514, 5506, 5895, 5815, 5945, 5830, 6484, 6415, 6420, 6425, 6716, 6712, 6844, 29660, 27009, 18025, 18185, 18415, 18620, 19220, 21535, 21530, 21735, 21730, 21935, 21930, 22135, 22130, 23095, 206, 205, 340, 30164, 506, 503, 1412, 1422, 1418, 1419, 1512, 1522, 1518, 1618, 1622, 1623, 1676, 1674, 1739, 1761, 1762, 1820, 1822, 1879, 1902, 1901, 1963, 1960, 2019, 2042, 2041, 2098, 2096, 2396, 2447, 2449, 2445, 2484, 2490, 2577, 2578, 2588, 2606, 2619, 2615, 2616, 2617, 3315, 3318, 3349, 3385, 3388, 3409, 3455, 3886, 3884, 4008, 4030, 4028, 4029, 4037, 4038, 4039, 6012, 6086, 6040, 6042, 6192, 6233, 6292, 6333, 6433, 6471, 7007, 7052, 7096, 7142, 7192, 7242, 7292, 7342, 8007, 8016, 8017, 8032, 8073, 8443, 9006, 9031, 10007, 10032, 10042, 10111, 10110, 10452, 10488, 10490, 10583, 10582, 10462, 10651, 10653, 10581, 10580, 10715, 10862, 10902, 10906, 10947, 10952, 11001, 10997, 11162, 11207, 11212, 11254, 11282, 11421, 11426, 11424, 11464, 11465, 11466, 11467, 11468, 11536, 11535, 11533, 11534, 11852, 11866, 11868, 11880, 11881, 11882, 11883, 11884, 11885, 11886, 11887, 11888, 13070, 13152, 13251, 13377, 13379, 13312, 13510, 13511, 13731, 13738, 32103, 30179, 468, 471, 1012, 1052, 1033, 1074, 1075, 1032, 1737, 1738, 1736, 1768, 1766, 3020, 3272, 5004, 5071, 5020, 5150, 7036, 7039, 7042, 7045, 7280, 7380, 7480, 7580, 9117, 9116, 10390, 10389, 16182, 17012, 17080, 17082, 18093, 18005, 18457, 18456, 18252, 19012, 19010, 19874, 20065, 19033, 20095, 19165, 20145, 19392, 20184, 19592, 22306, 22304, 24063, 24052, 24113, 24105, 25113, 25683, 25693, 25153, 25062, 25283, 25333, 26171, 26216, 26212, 26151, 26252, 26284
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, 1450, 2349, 3330, 4394, -1, 6224, 810, 6351, 7915, 8391, 9690, 10240, 16750, 16742, 19823
     * @param param4 Unknown parameter. Could be command line reference. Could be init line reference. Possible values: 0, 1, -1, 2
     * @param param5 Unknown parameter. Possible values: 0, -1, 10000, 5000, 1000, 30000, 3000, 15000
     */
    private commandKillSpecProc(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 55 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 44, 122, 125, 128, 182, 3740, 3020, 245, 172, 174, 175, 176, 177, 18, 41, 61, 78, 59, 55, 52, 11800, 370, 1278, 1210, 1230, 1250, 1270, 1610, 111, 1970, 30, 63, 43, 64, 13, 37, 38, 6, 7460, 339, 341, 343, 390, 391, 392, 393, 462, 476, 477, 478, 480, 481, 482, 23400
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Could be init line reference. Possible values: 0, 16, 32, 64
     */
    private commandLocate(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 41 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 319, 277, 136, 120, 123, 126, 180, 131, 190, 191, 192, 193, 212, 3280, 238, 242, 920, 950, 970, 1200, 1220, 1240, 1260, 1410, 1610, 365, 730, 1000, 2000, 4040, 4050, 4060, 4070, 12040, 13000, 13010, 13020, 13030, 13040, 15010
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Possible values: -1, 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandLockDoor(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 76 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 16, 17, 18, 19, 20, 21, 22, 23, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 122, 125, 128, 182, 3020, 245, 174, 175, 176, 177, 1278, 7460, 390, 391, 392, 393
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandMakeobj(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Show huge text middle of the screen.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, 4315, -1
     * @param param4 Unknown parameter. Always 0
     * @param textReference Text to be shown. Reference to translation file.
     */
    private commandMessageBrief(line: number | null, param1: number, nextLine: number, param3: number, param4: number, textReference: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 91 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 475, 0, 1450, 1892, 2940, 3330, 4394, 5170, 6224, 2676, 4340, 6351, 9690, 10240, 17276, 18581, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Possible values: 0, 50000, 25000, 30000, 35000, 40000, 45000, 20000
     */
    private commandMissionEnd(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Shows message brief on bottom of the screen. Brief icon is a mobile phone.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 0, 227, 267
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, 475, 896, 830, 1450, 1400, 1892, 6900, 2349, 3, 3330, 5170, 6224, -1, 20000, 44, 2630, 2676, 6351, 7912, 7915, 7909, 9670, 9690, 10240, 16742, 17276, 18581, 19823, 31291, 1
     * @param param4 Unknown parameter. Always 0
     * @param textReference Text to be shown. Reference to translation file.
     */
    private commandMobileBrief(line: number | null, param1: number, nextLine: number, param3: number, param4: number, textReference: number): number {
        this.game.showText(textReference, "mobile");
        return nextLine;
    }

    /**
     * Unknown function. Used 7 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 188, 191, 195, 246, 18340, 18370, 18410
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Possible values: 3, 4, 2
     * @param param5 Unknown parameter. Always 0
     */
    private commandModelHunt(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 12 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 68, 105, 48, 3500, 5800, 5900, 4, 0, 67
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Always 4
     * @param param4 Unknown parameter. Always 30
     * @param param5 Unknown parameter. Possible values: 100, 0
     */
    private commandMphone(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): ICommandResult {
        // TODO: Wait function: answer a phone.
        return { lineJump: 0 };
    }

    /**
     * Unknown function. Used 8 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 400, 406, 418, 412, 17732, 17734, 17736, 5061
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: -1, -2
     * @param param4 Unknown parameter. Could be command line reference. Possible values: 327, 341, 363, 479, 17717, 4008
     * @param param5 Unknown parameter. Possible values: -1, 0
     */
    private commandNextKick(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 199, 240
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandObtain(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 21 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 267, 320, 276, 280, 566, 570, 129, 206, 207, 249, 214, 215, 1310, 1311, 1630, 2516, 7742, 7741
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandOpenDoor(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Shows a text in pager.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param textReference Text to be shown. Reference to translation file.
     */
    private commandPBrief(line: number | null, param1: number, nextLine: number, param3: number, param4: number, textReference: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 42 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Possible values: 18, 60, 120, 90, 80, 100, 30, 320, 440, 160, 400, 200
     * @param param5 Unknown parameter. Could be text reference. Possible values: 1500, 2502, 3502
     */
    private commandPBriefTimed(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 51 times.
     * @param line Line number of command.
     * @param reference Reference to an init object (PARK or BARRIER).
     * @param nextLine Next command line.
     * @param dummyReference Reference to an init object (DUMMY).
     * @param respawnSquare Respawn player near garage. 0 - South, 1 - West, 2 - North, 3 - East
     * @param points. Reward player with this amount of points.
     */
    private commandPark(line: number | null, reference: number, nextLine: number, dummyReference: number, respawnSquare: number, points: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 135 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 189, 253, 230, 198, 244, 247, 265, 612, 315, 319, 327, 270, 277, 578, 593, 628, 629, 627, 139, 116, 118, 136, 120, 123, 180, 126, 131, 190, 191, 192, 193, 3720, 205, 162, 148, 149, 150, 151, 3000, 3010, 213, 212, 3280, 238, 242, 700, 710, 720, 730, 920, 1200, 1220, 1240, 1260, 1375, 1410, 1380, 1510, 1520, 1530, 7385, 7390, 7392, 7393, 7394, 7395, 7396, 7397, 6000, 6030, 6060, 6110, 7610, 175, 249, 250, 251, 252, 279, 483, 283, 340, 342, 350, 351, 365, 374, 395, 396, 397, 398, 425, 426, 427, 428, 429, 445, 463, 464, 475, 479, 650, 652, 740, 750, 760, 770, 780, 790, 800, 810, 1000, 1030, 1160, 2000, 4040, 4050, 4060, 4070, 8000, 12040, 13000, 13010, 13030, 13040, 14010, 15010, 15030, 15050, 16030
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Possible values: 0, 1000
     */
    private commandParkedOn(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 6140, 6150
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandParkedPixelsOn(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 18 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 253, 238, 198, 270, 373, 593, 640, 136, 248, 279, 365, 1030, 7000, 14050, 14010, 16030
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Could be init line reference. Possible values: 400, 0, -1
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 252, 150, 152, 199, 271, 339, 600, 632, 135, 247, 281, 366, 1050, 7040, 14040, 16050
     * @param param5 Unknown parameter. Always 0
     */
    private commandPedBack(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 392 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 252, 299, 300, 301, 302, 249, 233, 237, 382, 383, 384, 385, 386, 387, 388, 267, 268, 150, 152, 227, 228, 199, 304, 225, 226, 238, 332, 295, 323, 324, 325, 326, 255, 256, 250, 345, 346, 347, 351, 271, 146, 147, 148, 335, 336, 339, 595, 596, 597, 598, 604, 605, 606, 607, 600, 601, 602, 608, 609, 631, 632, 633, 135, 121, 124, 181, 127, 183, 184, 185, 186, 187, 188, 3750, 3760, 3770, 3780, 3272, 3274, 163, 165, 3070, 3080, 158, 159, 3022, 3024, 3026, 3028, 247, 168, 169, 170, 139, 140, 141, 142, 143, 257, 258, 259, 260, 261, 262, 263, 264, 254, 240, 241, 246, 172, 11800, 11810, 370, 380, 390, 400, 410, 420, 425, 310, 320, 330, 340, 350, 741, 770, 771, 772, 773, 774, 775, 776, 777, 778, 779, 780, 781, 980, 990, 1000, 1005, 1210, 1230, 1250, 1270, 1302, 1303, 1304, 1305, 1306, 1307, 1308, 1309, 1470, 1615, 1810, 1830, 1890, 1900, 1910, 1920, 1930, 1940, 1980, 1990, 6010, 6020, 6040, 6050, 6070, 6080, 6090, 6100, 6160, 6170, 6180, 6190, 6200, 6210, 6220, 6230, 7100, 7110, 7120, 7130, 7140, 7150, 7160, 7170, 7400, 7410, 7420, 7430, 7440, 7450, 7630, 7640, 7650, 7660, 7670, 7680, 7690, 7700, 7701, 7702, 9500, 9510, 9520, 9530, 213, 970, 281, 285, 286, 287, 341, 343, 352, 353, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 366, 367, 368, 376, 377, 378, 379, 423, 424, 431, 432, 433, 434, 435, 436, 437, 438, 439, 440, 441, 442, 443, 430, 447, 448, 449, 451, 452, 453, 454, 455, 456, 457, 458, 462, 8550, 465, 466, 467, 468, 469, 470, 471, 472, 476, 477, 478, 480, 481, 482, 670, 680, 690, 700, 710, 1050, 1090, 1100, 1110, 1120, 1130, 1140, 1150, 23400, 1020, 1080, 2060, 2070, 2080, 2090, 3000, 3020, 4000, 4010, 4020, 4030, 5000, 5010, 5020, 5030, 5040, 5050, 5060, 5070, 5080, 5090, 5130, 5140, 5150, 5160, 5170, 5180, 5182, 5184, 6030, 6060, 6110, 6120, 6130, 6140, 6150, 7190, 7200, 7040, 7050, 7060, 7080, 7090, 9010, 9020, 9030, 9040, 9050, 9000, 10000, 10020, 10050, 10080, 10110, 11100, 11070, 11170, 11120, 11030, 11130, 11160, 11090, 11190, 12000, 12010, 12020, 12030, 12280, 12282, 12050, 12060, 12070, 14040, 16050
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: -1, 0, 2668, 342, 1905, 1907, 1909, 1911, 23500, 1230, 1240, 1250, 1260, 1270, 1280
     * @param param4 Unknown parameter. Possible values: 0, 147, 134, 146, 41, 139, 140, 136, 142, 137, 145, 19, 133, 33, 144, 132, 135, 138, 38, 30, 15, 143, 154, 155, 156, 170, 171, 172
     * @param param5 Unknown parameter. Could be init line reference. Possible values: 0, 85, -1, 209
     */
    private commandPedOn(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 40 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 319, 277, 579, 136, 131, 212, 3280, 238, 242, 920, 950, 960, 970, 1272, 1280, 1290, 1300, 1380, 1410, 1610, 175, 240, 241, 483, 365, 1000, 2000, 13020, 13000, 13010, 13030, 13040, 15010
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandPedOutOfCar(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 19 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 3272, 3274, 3070, 3080, 158, 159, 1274, 1460, 7100, 7110, 7120, 7130, 7140, 7150, 7160, 7170, 339, 341, 343
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Possible values: 0, -1
     * @param param5 Unknown parameter. Always 0
     */
    private commandPedPolice(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 131 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 251, 250, 389, 390, 391, 392, 488, 489, 490, 403, 404, 296, 342, 343, 623, 643, 644, 645, 646, 647, 648, 649, 650, 651, 394, 337, 338, 688, 634, 635, 641, 642, 275, 460, 470, 480, 450, 440, 430, 540, 550, 560, 570, 580, 590, 747, 1450, 1840, 2010, 2030, 2020, 9550, 9540, 9560, 181, 214, 3500, 3600, 3700, 3800, 4300, 4400, 4500, 4600, 491, 23200, 23201, 23202, 23203, 23204, 23205, 23206, 23207, 1020, 310, 320, 330, 340, 350, 360, 370, 380, 400, 410, 420, 1030, 1110, 1120, 1130, 2100, 2110, 2120, 2130, 3082, 3083, 3084, 3085, 3086, 3087, 3088, 3089, 3090, 3030, 3093, 3092, 4080, 4090, 4100, 4110, 9070, 10030, 10060, 10090, 10120, 10140, 12230, 12240, 12250
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 249, 237, 225, 295, 622, 255, 395, 335, 687, 631, 163, 380, 390, 400, 410, 420, 425, 741, 1460, 1830, 1990, 1890, 1900, 9500, 9510, 9520, 9530, 180, 213, 5100, 5900, 492, 451, 452, 453, 454, 455, 456, 457, 458, 1160, 1180, 470, 510, 550, 590, 1020, 1080, 1090, 1100, 2060, 2070, 2080, 2090, 3000, 3020, 4000, 4010, 4020, 4030, 9000, 10000, 12050, 12060, 12070
     * @param param5 Unknown parameter. Always 0
     */
    private commandPedSendto(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 164 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 238, 3024, 3026, 3028, 11800, 770, 771, 772, 773, 774, 775, 776, 777, 778, 779, 780, 781, 6040, 6050, 6070, 6080, 6090, 6100, 6160, 6170, 6180, 6190, 6200, 6210, 6220, 6230, 7150, 7160, 7170, 7630, 7640, 7650, 7660, 7670, 7680, 7690, 7700, 7701, 7702, 240, 492, 287, 355, 358, 363, 367, 368, 23633, 467, 471, 1090, 1110, 1140, 2060, 2070, 2080, 2090, 3000, 4000, 4010, 4020, 4030, 5130, 6120, 7110, 7120, 9010, 9020, 9030, 9040, 9050, 12000, 12010, 12020, 12030, 12280, 12282, 13160, 13140, 13150, 13170, 13180
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Possible values: 2, 4, 3
     * @param param5 Unknown parameter. Always 0
     */
    private commandPedWeapon(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 6 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 200, 205, 210, 215, 220, 7000
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandPixelCarOn(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 167 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 306, 307, 308, 309, 310, 322, 330, 332, 333, 341, 342, 311, 313, 315, 316, 323, 325, 334, 337, 345, 317, 326, 338, 339, 347, 348, 350, 352, 360, 364, 367, 372, 373, 374, 319, 328, 340, 353, 357, 371, 7480, 7490, 7500, 7510, 7520, 7530, 7540, 7550, 7560, 7570, 7580, 7582, 7584, 7586, 7588, 7590, 7592, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 381, 382, 383, 384, 385, 386, 387, 388, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422, 820, 830, 840, 850, 860, 870, 880, 890, 900, 910, 920, 930, 940, 950, 8050, 8060, 8070, 8080, 8090, 8100, 8110, 8120, 8130, 8140, 8150, 8160, 8170, 8180, 8190, 8200, 9080, 9090, 9100, 9110, 9120, 9130, 9140, 9150, 9160, 12080, 12090, 12100, 12110, 12120, 12130, 12140, 12150, 12160, 12170, 12180, 15100, 15110, 15120, 15130, 15140, 15150, 15160, 15170
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Possible values: 0, 2, 1, 3
     * @param param5 Unknown parameter. Possible values: 0, 25000, 2000, 30000
     */
    private commandPlainExplBuilding(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 485, 1000
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, 1210
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandPlayerAreBothOnscreen(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 32 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 23013, 23014, 23012, 23010, 23011, 23000, 23001, 23002, 23003, 23004, 23005, 23006, 23007, 23008, 23009, 23015, 23016
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 10000
     */
    private commandPowerupOff(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 4072 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 528, 529, 531, 532, 534, 535, 537, 443, 444, 445, 457, 458, 472, 538, 539, 491, 540, 446, 447, 459, 460, 468, 476, 478, 541, 543, 448, 449, 461, 462, 469, 473, 450, 470, 477, 451, 463, 464, 471, 474, 484, 452, 465, 481, 453, 454, 466, 479, 393, 527, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 436, 437, 438, 439, 271, 272, 276, 277, 278, 279, 280, 492, 493, 494, 495, 496, 507, 508, 509, 510, 512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525, 526, 545, 546, 547, 556, 557, 558, 559, 560, 561, 562, 497, 498, 533, 551, 501, 502, 552, 503, 504, 542, 553, 536, 505, 506, 548, 554, 563, 544, 550, 499, 500, 440, 441, 442, 455, 456, 467, 475, 480, 482, 483, 309, 310, 357, 358, 359, 360, 361, 652, 653, 654, 655, 656, 663, 664, 665, 666, 667, 668, 669, 670, 671, 672, 673, 490, 511, 530, 549, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 10, 20, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 273, 274, 275, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 120, 992, 993, 997, 3785, 3740, 994, 9520, 995, 9470, 996, 9050, 320, 330, 340, 350, 370, 380, 390, 580, 590, 600, 610, 620, 630, 640, 650, 660, 680, 690, 700, 710, 720, 740, 750, 760, 770, 780, 790, 800, 810, 820, 830, 840, 850, 860, 870, 880, 890, 900, 910, 920, 930, 940, 950, 960, 970, 980, 990, 9800, 9810, 9820, 9830, 9840, 9850, 9000, 9001, 9002, 9003, 9004, 9005, 9006, 9007, 9008, 9009, 9010, 9011, 9012, 9013, 9014, 9015, 9016, 9017, 9018, 9019, 9020, 9021, 9022, 9023, 9024, 9060, 9070, 9080, 9090, 9100, 9110, 9120, 9130, 9140, 9150, 9160, 9180, 9170, 2610, 2630, 2650, 2670, 2690, 2710, 11010, 11020, 11030, 11040, 11050, 11060, 11070, 11080, 11090, 11100, 11110, 11120, 11130, 11140, 11150, 11160, 11170, 11180, 11190, 11200, 11210, 11220, 11230, 11240, 11250, 11260, 11270, 11280, 11290, 11300, 11320, 11340, 11350, 11360, 11370, 11380, 11390, 11400, 11410, 11420, 11430, 11440, 11450, 11460, 11470, 11480, 11490, 11500, 11510, 11520, 11530, 11540, 11550, 11560, 11570, 11580, 11590, 11600, 11610, 11620, 11630, 11640, 11650, 11660, 11670, 11680, 11690, 11700, 11701, 11702, 11710, 595, 596, 1325, 1330, 1335, 7171, 7180, 5010, 5020, 5030, 5040, 5050, 5060, 5070, 5080, 5090, 5100, 5110, 5120, 5130, 5140, 5150, 5160, 5170, 5180, 5190, 5200, 5210, 5220, 5230, 5240, 5250, 5260, 5270, 5280, 5290, 5300, 5320, 5330, 5340, 5350, 5360, 5370, 5380, 5390, 5400, 5410, 5420, 5430, 5440, 5450, 5460, 5470, 5480, 5490, 5500, 5510, 5520, 5530, 5540, 5550, 5560, 5570, 5580, 5590, 5600, 5610, 5620, 5630, 5640, 5650, 5660, 5670, 5680, 5690, 5700, 5701, 5702, 2525, 5710, 7455, 11330, 9030, 9031, 9032, 9033, 9034, 9035, 9037, 9038, 9039, 9051, 9052, 9053, 9054, 9055, 9056, 9057, 9058, 9059, 9061, 9062, 9063, 9064, 9065, 9066, 9067, 9068, 9069, 9071, 9072, 9073, 9074, 9075, 9076, 9077, 9078, 9079, 9081, 9082, 9083, 9084, 19000, 19001, 19002, 19003, 19004, 19005, 19006, 19007, 19008, 19009, 19010, 19011, 19012, 19013, 19014, 19015, 19016, 19017, 19018, 19019, 19020, 19021, 19022, 19023, 19024, 19025, 19030, 19031, 19032, 19033, 19034, 19035, 19036, 19037, 19038, 19039, 19040, 19041, 19050, 19051, 19052, 19053, 19054, 19055, 19056, 19057, 19058, 19059, 19060, 19061, 19062, 19063, 19064, 19065, 19066, 19067, 19068, 19069, 19070, 19071, 19072, 19073, 19074, 19075, 19076, 19077, 19078, 19079, 19080, 19081, 19082, 19084, 23013, 23014, 20682, 20684, 23500, 23501, 23502, 23503, 23504, 23505, 23506, 23507, 23508, 23509, 23510, 23511, 23512, 23012, 23010, 23011, 23000, 23001, 23002, 23003, 23004, 23005, 23006, 23007, 23008, 23009, 23301, 23302, 23303, 23304, 23305, 23306, 23307, 23308, 23309, 23310, 23311, 23312, 23313, 23314, 23315, 23316, 23317, 23318, 23319, 23320, 23321, 23322, 23323, 23324, 23325, 9036, 9085, 9101, 9102, 9103, 9104, 9105, 9106, 9107, 9108, 9109, 9111, 9112, 9113, 9114, 9115, 9116, 9117, 9118, 9119, 9121, 9122, 9123, 9124, 9125, 9126, 9127, 23015, 23016, 19028, 19027, 19026, 19083, 19085, 19101, 19102, 19103, 19104, 19105, 19106, 19107, 19108, 19109, 19110, 19111, 19112, 19113, 19114, 19115, 19116, 19117, 19118, 19119, 19120, 19121, 19122, 19123, 19124, 19125, 19126
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, 2349, 7942, -1
     * @param param4 Unknown parameter. Possible values: 0, -1
     * @param param5 Unknown parameter. Always 0
     */
    private commandPowerupOn(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Points a RED arrow at a given goal. This arrow will NOT be reset/removed unless a “RED_ARROW_OFF” is called.
     * @param line Line number of command.
     * @param loc Unknown parameter. Could be init line reference. Possible values: 304, 570, 3995, 9450, 23400
     * @param nextLine Next command line.
     * @param param3 Unused parameter.
     * @param param4 Unused parameter.
     * @param score Add to player score.
     */
    private commandRedArrow(line: number | null, loc: number, nextLine: number, param3: number, param4: number, score: number): number {
        this.game.score += score;
        return nextLine;
    }

    /**
     * Cancels the red arrow.
     * @param line Line number of command.
     * @param param1 Unused parameter.
     * @param nextLine Next command line.
     * @param param3 Unused parameter.
     * @param param4 Unused parameter.
     * @param score Add to player score.
     */
    private commandRedArrowOff(line: number | null, param1: number, nextLine: number, param3: number, param4: number, score: number): number {
        this.game.score += score;
        return nextLine;
    }

    /**
     * Unknown function. Used 24 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 249, 295, 631, 632, 633, 3300, 947, 1350, 1360, 1370, 180, 492, 23633, 1160, 1180, 13160, 13140, 13150, 13170, 13180, 15193
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Possible values: 136, 140, 145, 144, 147, 138, 134
     * @param param5 Unknown parameter. Always 0
     */
    private commandRemapPed(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 497 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, 11000, 475, 1450, -1, 3330, 3880, 6224, 8396, 9690, 5000, 10240, 17276, 31291
     * @param param4 Unknown parameter. Possible values: 0, -1
     * @param param5 Unknown parameter. Possible values: 0, -1
     */
    private commandReset(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 280 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Possible values: -1, 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandResetKf(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Always -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandResetWithBriefs(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 37 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be command line reference. Possible values: 17120, 11220, 11320, 23100, 29944, 31044, 31144, 32444, 32544, 32644
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandReturnControl(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 8 times.
     * @param line Line number of command.
     * @param scoreToCheck Score to check against.
     * @param nextLineIfTrue Next command line if current score is equal or greater than given score limit.
     * @param nextLineIfFalse Next command line if current score is less than given score limit.
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandScoreCheck(line: number | null, scoreToCheck: number, nextLineIfTrue: number, nextLineIfFalse: number, param4: number, param5: number): number {
        return this.game.score < scoreToCheck ? nextLineIfFalse : nextLineIfTrue;
    }

    /**
     * Unknown function. Used 46 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 215, 319, 277, 579, 136, 131, 3720, 235, 240, 245, 230, 260, 265, 270, 255, 1380, 1410, 1610, 175, 251, 252, 483, 365, 1000, 2000, 14010, 15010
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 217, 376, 377, 378, 218, 618, 619, 621, 282, 283, 284, 393, 587, 584, 585, 586, 3047, 132, 3730, 225, 250, 1400, 1430, 1631, 179, 275, 276, 277, 278, 485, 372, 1010, 2040, 14020, 15020
     * @param param5 Unknown parameter. Always 0
     */
    private commandSendto(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 14 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 160, 235, 290, 375, 399, 400, 401, 402, 20915, 2172, 8040, 15090, 16070
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Could be command line reference. Possible values: 1047, 1034, 5591, 2621, 6085, 7042, 7134, 7234, 7334, 8442, 3275, 17053, 25252, 26255
     * @param param5 Unknown parameter. Always 1
     */
    private commandSetKilltrig(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 15 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 1200, 1220, 1240, 1260, 1410, 283, 374, 20912, 730, 2000, 8000, 12040, 15050, 16030
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandSetNoCollide(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 20 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 237, 255, 631, 3750, 3760, 3770, 3780, 11810, 1686, 5100, 5900, 470, 510, 550, 590, 10020, 10050, 10080, 10110
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Possible values: 3, 4, 2
     * @param param5 Unknown parameter. Always 0
     */
    private commandSetPedSpeed(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 35 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 230, 297, 485, 265, 612, 565, 213, 920, 295, 299, 301, 303, 305, 307, 309, 311, 313, 18440, 18460, 18480, 18500, 18520, 18540, 18560, 18580, 18600, 18620
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Could be command line reference. Possible values: 4, 0, 6, 1, 2
     * @param param5 Unknown parameter. Possible values: 0, 20000, 25000, 15000, 40000
     */
    private commandSetbomb(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 189, 253
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Always 0
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 190, 263
     * @param param5 Unknown parameter. Always 0
     */
    private commandSetupRepo(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Shows a brief message at bottom of the screen. Brief icon is a mouth.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, 274, -1, 9, 16720, 19810, 31288
     * @param param4 Unknown parameter. Always 0
     * @param textReference Text to be shown. Reference to translation file.
     */
    private commandSpeechBrief(line: number | null, param1: number, nextLine: number, param3: number, param4: number, textReference: number): number {
        this.game.showText(textReference, "mouth");
        return nextLine;
    }

    /**
     * Unknown function. Used 12 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 582, 2570, 2600, 7470, 18754, 18714, 18734
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 579, -1
     * @param param5 Unknown parameter. Could be init line reference. Possible values: 3, 100, 5
     */
    private commandStartModel(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Plays intro sound.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 303, 425, 83, 120, 173, 210
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 30000, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandStartup(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        this.commandDisable(line, param1, 0, 0, 0, 0);
        this.game.playSound("intro");
        return nextLine;
    }

    /**
     * Waits until user get in a car.
     * @param line Line number of command.
     * @param car Reference to a car.
     * @param nextLineWhenStolen Next command line after player has stolen a car.
     * @param nextLineWhenTimeout Next command line if user fails to steal the car within time limit.
     * @param timer Timer to steal the car. Frames? If timer is set to 0 there is no time limit.
     * @param score Add to player score.
     */
    private commandSteal(line: number | null, car: number, nextLineWhenStolen: number, nextLineWhenTimeout: number, timer: number, score: number): ICommandResult {
        const reference = this.initReferences.get(car);
        if (reference instanceof Vehicle) {
            // TODO: Wait function
            return { lineJump: 0 };
        }

        return { commandReference: nextLineWhenTimeout }
    }

    /**
     * Unknown function. Used 122 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 271, 272, 492, 493, 494, 495, 496, 309, 357, 358, 359, 360, 361, 310, 2610, 2630, 2650, 2670, 2690, 2710, 9030, 9031, 9032, 9033, 9034, 9035, 9036, 9037, 9038, 9039, 19030, 19031, 19032, 19033, 19034, 19035, 19036, 19037, 19038, 19039, 19040, 19041
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandStopFrenzy(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Waits for <timer> and it goes to <succ>.
     * @param line Line number of command.
     * @param param1 Unused parameter.
     * @param nextLine Next command line.
     * @param param3 Unused parameter.
     * @param timer Frames to wait.
     * @param score Add to player score.
     */
    private commandSurvive(line: number | null, param1: number, nextLine: number, param3: number, timer: number, score: number): ICommandResult {
        let waitTime = timer * FramesPerSecond;
        let waitFunction = (_: Game, time: number) => {
            waitTime -= time;
            return waitTime <= 0;
        };

        return { waitFunction, commandReference: nextLine, score };
    }

    /**
     * Unknown function. Used 2 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 199, 240
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: -1, 0
     * @param param4 Unknown parameter. Possible values: 200, 242
     * @param param5 Unknown parameter. Possible values: 50000, 0
     */
    private commandThrow(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 14 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Always 0
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 0, 2676
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandUnfreezeEnter(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 27 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 319, 277, 578, 136, 131, 212, 3280, 238, 242, 920, 1020, 1040, 1060, 1380, 365, 1000, 2000, 13020, 13000, 13010, 13030, 13040, 15010
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 0, -1
     * @param param4 Unknown parameter. Possible values: -1, 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandUnlockDoor(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 100 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 251, 250, 389, 390, 391, 392, 488, 489, 490, 403, 404, 296, 342, 343, 623, 643, 644, 645, 646, 647, 648, 649, 650, 651, 394, 337, 338, 688, 634, 635, 641, 642, 275, 1450, 2010, 2030, 2020, 181, 214, 3500, 3600, 3700, 3800, 4300, 4400, 4500, 4600, 491, 1020, 310, 320, 330, 340, 350, 360, 370, 380, 400, 410, 420, 430, 440, 450, 460, 1030, 2100, 2110, 2120, 2130, 3082, 3083, 3084, 3085, 3086, 3087, 3088, 3089, 3090, 3030, 3093, 3092, 4080, 4090, 4100, 4110, 9070, 10030, 10060, 10090, 10120, 10140, 12230, 12240, 12250
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Possible values: 780, 784, -1, 0, 5910, 3420, 3430, 3440, 3450, 7270, 7370, 7470, 7570
     * @param param4 Unknown parameter. Could be init line reference. Possible values: 249, 237, 225, 295, 622, 255, 395, 335, 687, 631, 163, 1460, 1990, 1890, 1900, 180, 213, 5100, 5900, 492, 1160, 1180, 470, 510, 550, 590, 1020, 2060, 2070, 2080, 2090, 3000, 3020, 4000, 4010, 4020, 4030, 9000, 10000, 12050, 12060, 12070
     * @param param5 Unknown parameter. Always 0
     */
    private commandWaitForPed(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Unknown function. Used 60 times.
     * @param line Line number of command.
     * @param param1 Unknown parameter. Could be init line reference. Possible values: 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
     * @param nextLine Next command line.
     * @param param3 Unknown parameter. Could be command line reference. Possible values: 230, 330, 430, 510, 530, 630, 710, 180, 280, 380, 480, 580, 680, 730, 780, 810, 830, 930, 952
     * @param param4 Unknown parameter. Always 0
     * @param param5 Unknown parameter. Always 0
     */
    private commandWaitForPlayers(line: number | null, param1: number, nextLine: number, param3: number, param4: number, param5: number): number {
        return nextLine;
    }

    /**
     * Wrecks a train.
     * @param line Line number of command.
     * @param train Reference to a dummy object, that has a train reference set.
     * @param nextLine Next command line.
     * @param param3 Always -1
     * @param param4 Always -1
     * @param score Add to player score.
     */
    private commandWreckATrain(line: number | null, train: number, nextLine: number, param3: number, param4: number, score: number): number {
        const trainReference = this.initReferences.get(train);
        if ((!this.game.trainSystem.isWrecked) && (trainReference instanceof Dummy) && (trainReference.value instanceof Vehicle) && (trainReference.value.info.type === "train")) {
            this.game.score += score;
            console.error("Not implemented: Blow up a train.");
            this.game.trainSystem.isWrecked = true;
        }

        return nextLine;
    }
}

/** Counter contains a numeric value, and possible trigger. */
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

/** Dummy object doesn't really do anything. It just contains a some value. */
class Dummy {
    public value: unknown = null;
}

class Thread {
    public pointer: number = 0;
    public keepThisThread: boolean = false;

    public parent: Thread | null = null;

    public readonly children: Thread[] = [];

    public stop() {

    }
}

interface ICoordinates {
    readonly x: number;
    readonly y: number;
    readonly z: number;
}

interface ICommandResult {
    /** Jumps forward (backward if negative) a specific number of rows. */
    lineJump?: number;

    /** Jumps to a numbered command row. */
    commandReference?: number;

    /** True if current thread should be ended. */
    exitThread?: true;

    /** Function to return true before code can continue. */
    waitFunction?: (game: Game, time: number) => boolean;
    
    /** Add to player score. */
    score?: number;
}